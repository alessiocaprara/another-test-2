"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { updateRemoveUser, updateUser } from "../actions"

const userProfileSelectItemSchema = z.object({
    userField: z.string()
})

type userProfileSelectItemValues = z.infer<typeof userProfileSelectItemSchema>

interface UserProfileSelectItemProps {
    userId: string,
    fieldName: string,
    label: string,
    possibileValues: { label: string, value: string }[],
    currentValue: string | null,
    onClose: () => void,
    className?: string,
}

export default function UserProfileSelectItem({ userId, fieldName, label, possibileValues, currentValue, onClose, className }: UserProfileSelectItemProps) {

    currentValue = possibileValues.find((item) => item.value === currentValue) ? currentValue : null

    const [isPendingTransition1, startTransition1] = useTransition();
    const [isPendingTransition2, startTransition2] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);

    const form = useForm<userProfileSelectItemValues>({
        resolver: zodResolver(userProfileSelectItemSchema),
        defaultValues: {
            userField: currentValue || undefined
        },
    });

    useEffect(() => {
        form.reset({
            userField: currentValue || undefined
        });
    }, [form, currentValue]);

    async function onSubmit(data: userProfileSelectItemValues) {
        startTransition1(async () => {
            try {
                if (!form.formState.dirtyFields.userField) return;
                const formData = new FormData();
                formData.set(fieldName, data.userField);
                await updateUser(userId, formData);
                onClose();
                toast({
                    description: "Profile successfully updated."
                })
            } catch (error) {
                toast({
                    variant: "destructive",
                    description: (error as Error).message
                })
            }
        })
    }

    return (


        <div className="px-4 space-y-8">
            <div className="flex pb-4">
                <div className="w-full flex flex-col">
                    <div className="flex items-center text-lg font-medium -ms-2">
                        <ArrowLeft className="opacity-80 hover:cursor-pointer hover:bg-muted rounded-full p-1" size={30} onClick={() => onClose()} />
                        Edit profile
                    </div>
                    <div className="text-sm text-muted-foreground">Make changes to your profile here. Click save when you are done.</div>
                </div>
            </div>
            <Form {...form} >
                <form id="select-item-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
                    <FormField
                        control={form.control}
                        name="userField"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                    <Select defaultValue={field.value || undefined} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={`Select a ${label.toLowerCase()}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="f">Female</SelectItem>
                                                <SelectItem value="m">Male</SelectItem>
                                                <SelectItem value="n">Rather not say</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <div className="space-x-3">
                <Button
                    type="submit"
                    form="select-item-form"
                    disabled={isPendingTransition1 || !form.formState.dirtyFields.userField || !form.watch("userField")}
                >
                    Save changes
                    {isPendingTransition1 && <Loader2 className="ml-1 h-4 w-4 animate-spin" />}
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" disabled={currentValue === null}>Remove</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader className="mb-6">
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            <DialogDescription>This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button
                                disabled={isPendingTransition2}
                                onClick={() => {
                                    startTransition2(async () => {
                                        try {
                                            await updateRemoveUser(userId, fieldName);
                                            setDialogOpen(false);
                                            onClose();
                                            toast({
                                                description: "Profile successfully updated."
                                            })
                                        } catch (error) {
                                            toast({
                                                variant: "destructive",
                                                description: (error as Error).message
                                            })
                                        }
                                    })
                                }}
                            >
                                Continue
                                {isPendingTransition2 && <Loader2 className="ml-1 h-4 w-4 animate-spin" />}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}