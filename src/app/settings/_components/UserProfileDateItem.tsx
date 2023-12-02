"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { isValidDate } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parse } from "date-fns"
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { updateRemoveUser, updateUser } from "../actions"

const userProfileDateItemSchema = z.object({
    userField: z.string().refine((value) => isValidDate(value), {
        message: 'Date must be in dd/mm/yyyy format and represent a valid date',
    })
})

type userProfileTextItemValues = z.infer<typeof userProfileDateItemSchema>

interface UserProfileDateItemProps {
    userId: string,
    fieldName: string,
    label: string,
    value: Date | null,
    onClose: () => void,
    className?: string,
}

export default function UserProfileDateItem({ userId, fieldName, label, value, onClose, className }: UserProfileDateItemProps) {

    const [isPendingTransition1, startTransition1] = useTransition();
    const [isPendingTransition2, startTransition2] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);

    const form = useForm<userProfileTextItemValues>({
        resolver: zodResolver(userProfileDateItemSchema),
        defaultValues: {
            userField: value ? format(value, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')
        },
    });

    useEffect(() => {
        form.reset({
            userField: value ? format(value, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')
        });
    }, [form, value]);

    async function onSubmit(data: userProfileTextItemValues) {
        startTransition1(async () => {
            try {
                if (!form.formState.dirtyFields.userField) return;
                const formData = new FormData();
                formData.set(fieldName, parse(data.userField, "dd/MM/yyyy", new Date()).toISOString());
                await updateUser(userId, formData);
                onClose();
                toast({
                    variant: "confirmation",
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
            <Form {...form}>
                <form id="date-item-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
                    <FormField
                        control={form.control}
                        name="userField"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>{label}</FormLabel>
                                <Popover>
                                    <FormControl>
                                        <div className="flex items-center">
                                            <Input
                                                {...field}
                                                placeholder='dd/mm/yyyy'
                                                className="w-1/3"
                                            />
                                            <PopoverTrigger asChild>
                                                <Button variant={"ghost"} className="hover:bg-transparent -m-10">
                                                    <CalendarIcon className="h-4 w-4 opacity-50 hover:cursor-pointer" />
                                                </Button>
                                            </PopoverTrigger>
                                        </div>
                                    </FormControl>
                                    <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="center">
                                        <Calendar
                                            mode="single"
                                            selected={isValidDate(field.value) ? parse(field.value, "dd/MM/yyyy", new Date()) : new Date()}
                                            onSelect={(date) => field.onChange(date ? format(date, "dd/MM/yyyy") : undefined)}
                                            defaultMonth={isValidDate(field.value) ? parse(field.value, "dd/MM/yyyy", new Date()) : new Date()}
                                            required
                                            disabled={(date: Date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </form>
            </Form>
            <div className="space-x-3">
                <Button
                    type="submit"
                    form="date-item-form"
                    disabled={isPendingTransition1 || !form.formState.dirtyFields.userField || !form.watch("userField")}
                >
                    Save changes
                    {isPendingTransition1 && <Loader2 className="ml-1 h-4 w-4 animate-spin" />}
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" disabled={value === null}>Remove</Button>
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
                                                variant: "confirmation",
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
            </div >
        </div>
    )
}