"use client"

import profilePicPlaceholder from "@/assets/profile-pic-placeholder.png"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { canvasPreview } from "@/lib/canvasPreview"
import { useDebounceEffect } from "@/lib/useDebounceEffect"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import * as z from "zod"
import { updateUser } from "../actions"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const userProfilePictureItemSchema = z.object({
    userField: z.any()
})

type userProfilePictureItemValues = z.infer<typeof userProfilePictureItemSchema>

interface UserProfileTextItemProps {
    userId: string,
    fieldName: string,
    label: string,
    value: string | null,
    onClose: () => void,
    className?: string,
}

export default function UserProfilePictureItem({ userId, fieldName, value, onClose, className }: UserProfileTextItemProps) {

    const [isPendingTransition1, startTransition1] = useTransition();
    const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
    const [imagePreviewIsDirty, setImagePreviewIsDirty] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const imgRef = useRef<HTMLImageElement>(null)
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)
    const [aspect, setAspect] = useState<number | undefined>(1 / 1)

    const blobUrlRef = useRef('')

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = new FileReader;
        file.onload = function () {
            setImagePreview(file.result);
            setImagePreviewIsDirty(true);
        }
        file.readAsDataURL(acceptedFiles[0])
    }, [])
    const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const form = useForm<userProfilePictureItemValues>({
        resolver: zodResolver(userProfilePictureItemSchema),
    });

    useEffect(() => {
        setImagePreview(null);
        setImagePreviewIsDirty(false);
    }, [value]);

    async function onSubmit(data: userProfilePictureItemValues) {
        startTransition1(async () => {
            try {
                if (!imagePreviewIsDirty) return;
                const formData = new FormData();
                if (imagePreviewIsDirty && acceptedFiles.length > 0) formData.set("file", acceptedFiles[0]);
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

    function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
        return centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                aspect,
                mediaWidth,
                mediaHeight,
            ),
            mediaWidth,
            mediaHeight,
        )
    }

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }

    async function onDownloadCropClick() {
        const image = imgRef.current
        const previewCanvas = previewCanvasRef.current
        if (!image || !previewCanvas || !completedCrop) {
            throw new Error('Crop canvas does not exist' + image + " " + previewCanvas + " " + completedCrop)
        }

        // This will size relative to the uploaded image
        // size. If you want to size according to what they
        // are looking at on screen, remove scaleX + scaleY
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height

        const offscreen = new OffscreenCanvas(
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
        )
        const ctx = offscreen.getContext('2d')
        if (!ctx) {
            throw new Error('No 2d context')
        }

        ctx.drawImage(
            previewCanvas,
            0,
            0,
            previewCanvas.width,
            previewCanvas.height,
            0,
            0,
            offscreen.width,
            offscreen.height,
        )
        // You might want { type: "image/jpeg", quality: <0 to 1> } to
        // reduce image size
        const blob = await offscreen.convertToBlob({
            type: 'image/png',
        })

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current)
        }
        blobUrlRef.current = URL.createObjectURL(blob)
        hiddenAnchorRef.current!.href = blobUrlRef.current
        hiddenAnchorRef.current!.click()
    }

    useDebounceEffect(
        async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                // We use canvasPreview as it's much faster than imgPreview.
                canvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                )
            }
        },
        100,
        [completedCrop],
    )

    const applyChanges = () => {
        if (previewCanvasRef.current) {
            const canvas = previewCanvasRef.current;
            const dataUrl = canvas.toDataURL();
            setImagePreview(dataUrl);
            setImagePreviewIsDirty(true);
        }
    };

    return (
        <>
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        <FormField
                            control={form.control}
                            name="userField"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profile picture</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-3">
                                            <div {...getRootProps()}>
                                                <Input
                                                    {...getInputProps()}
                                                    {...field}
                                                />
                                                <Image
                                                    src={imagePreview?.toString() || value || profilePicPlaceholder}
                                                    style={{ objectFit: "cover" }}
                                                    width={240}
                                                    height={240}
                                                    alt="preview image"
                                                    className="rounded-lg h-60 w-60"
                                                />
                                            </div>
                                            {isDragActive ?
                                                <p className="text-xs text-muted-foreground">Drop the files!</p> :
                                                <p className="text-xs text-muted-foreground">Drag and drop or click to select a file.</p>
                                            }
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-x-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button disabled={isPendingTransition1}>Modify</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you sure absolutely sure?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete your account
                                            and remove your data from our servers.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex flex-col items-center gap-3">
                                        <ReactCrop
                                            aspect={1}
                                            crop={crop}
                                            onChange={c => setCrop(c)}
                                            onComplete={(e) => {
                                                setCompletedCrop(e);
                                            }}
                                        >
                                            <img
                                                height={240}
                                                width={240}
                                                src={imagePreview?.toString() || value || profilePicPlaceholder.src}
                                                alt="profile pic"
                                                ref={imgRef}
                                                onLoad={onImageLoad}
                                            />
                                        </ReactCrop>
                                        {!!completedCrop && (
                                            <>
                                                <div>
                                                    <canvas
                                                        className="hidden"
                                                        ref={previewCanvasRef}
                                                        style={{
                                                            border: '1px solid black',
                                                            objectFit: 'contain',
                                                            // width: completedCrop.width,
                                                            width: 240,
                                                            // height: completedCrop.height,
                                                            height: 240,
                                                        }}
                                                    />
                                                </div>


                                                {/*  <button className="block" onClick={() => {
                                                        console.log(imgRef)
                                                        console.log(previewCanvasRef)
                                                        onDownloadCropClick()
                                                    }}>
                                                        Download Crop
                                                    </button>
                                                    <a
                                                        href="#hidden"
                                                        ref={hiddenAnchorRef}
                                                        download
                                                        style={{
                                                            position: 'absolute',
                                                            top: '-200vh',
                                                            visibility: 'hidden',
                                                        }}
                                                    >
                                                        Hidden download
                                                    </a> */}
                                                <DialogClose asChild>
                                                    <Button onClick={applyChanges}>Apply changes</Button>
                                                </DialogClose>
                                            </>
                                        )}
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <Button
                                type="submit"
                                disabled={isPendingTransition1 || !imagePreviewIsDirty}
                            >
                                Save changes
                                {isPendingTransition1 && <Loader2 className="ml-1 h-4 w-4 animate-spin" />}
                            </Button>
                        </div>

                    </form>
                </Form>

            </div >

        </>
    )
}