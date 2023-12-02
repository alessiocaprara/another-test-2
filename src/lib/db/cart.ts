import { cookies } from "next/dist/client/components/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Cart, CartItem, Prisma } from "@prisma/client";
import { prisma } from "./prisma-client";

//------------------------------------------------------------------------------------- EXTRA TYPES
export type CartWithProducts = Prisma.CartGetPayload<{
    include: { cartItems: { include: { product: true } } }
}>

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
    include: { product: true }
}>

export type ShoppingCart = CartWithProducts & {
    size: number,
    subtotal: number,
}

//------------------------------------------------------------------------------------- DB FUNCTIONS
export async function getCart(): Promise<ShoppingCart | null> {

    const session = await getServerSession(authOptions);

    let cart: CartWithProducts | null = null;

    if (session) {
        cart = await prisma.cart.findFirst({
            where: { userId: session.user.id },
            include: { cartItems: { include: { product: true } } },
        })
    } else {
        const localCartId = cookies().get("localCartId")?.value;
        cart = localCartId
            ? await prisma.cart.findUnique({
                where: { id: localCartId },
                include: { cartItems: { include: { product: true } } },
            })
            : null;
    }

    if (!cart) { return null }

    return {
        ...cart,
        size: cart.cartItems.reduce((acc, item) => acc + item.quantity, 0),
        subtotal: cart.cartItems.reduce((acc, item) => acc + item.quantity * item.product.price, 0),
    }
}

export async function createCart(): Promise<ShoppingCart> {
    const session = await getServerSession(authOptions);

    let newCart: Cart;

    if (session) {
        newCart = await prisma.cart.create({
            data: {
                userId: session.user.id
            }
        })
    } else {
        newCart = await prisma.cart.create({
            data: {}
        })
    }

    // Note: Needs encryption + secure settings in real production app
    cookies().set("localCartId", newCart.id);

    return {
        ...newCart,
        cartItems: [],
        size: 0,
        subtotal: 0
    }
}

export async function mergeAnonymousCartInUserCart(userId: string) {
    const localCartId = cookies().get("localCartId")?.value;
    const localCart = localCartId
        ? await prisma.cart.findUnique({
            where: { id: localCartId },
            include: { cartItems: true },
        })
        : null;

    if (!localCart) return;

    const userCart = await prisma.cart.findFirst({
        where: { userId },
        include: { cartItems: true },
    })

    await prisma.$transaction(async tx => {
        if (userCart) {
            const mergedCartItems = mergeCartItems(localCart.cartItems, userCart.cartItems);
            await tx.cartItem.deleteMany({
                where: { cartId: userCart.id }
            });
            await tx.cart.update({
                where: { id: userCart.id },
                data: {
                    cartItems: {
                        createMany: {
                            data: mergedCartItems.map(item => ({
                                productId: item.productId,
                                quantity: item.quantity,
                            }))
                        }
                    }
                }
            })
        } else {
            await tx.cart.create({
                data: {
                    userId,
                    cartItems: {
                        createMany: {
                            data: localCart.cartItems.map(item => ({
                                productId: item.productId,
                                quantity: item.quantity,
                            }))
                        }
                    }
                }
            })
        }
        await tx.cart.delete({
            where: { id: localCart.id }
        })
        cookies().set("localCartId", "");
    });
}

// The utility function below has been created with AI
function mergeCartItems(...cartItems: CartItem[][]) {
    return cartItems.reduce((acc, items) => {
        items.forEach((item) => {
            const existingItem = acc.find((i) => i.productId === item.productId);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                acc.push(item);
            }
        });
        return acc;
    }, [] as CartItem[]);
}