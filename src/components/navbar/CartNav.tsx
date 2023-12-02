"use client"

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "@/lib/db/cart";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface CartNavProps {
    cart: ShoppingCart | null;
}

export function CartNav({ cart }: CartNavProps) {

    return (

        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                    </div>
                    <div className="absolute top-0 right-0 rounded-sm py-[0.5px] px-[1px] font-bold bg-secondary text-primary text-[8px] leading-3">{cart?.size || 0}</div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 me-4">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{cart?.size || 0} Items</h4>
                        <p className="text-sm text-muted-foreground">Subtotal: {formatPrice(cart?.subtotal || 0)}</p>
                    </div>
                    <Button asChild >
                        <Link href="/cart">View cart</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>

    )
}
