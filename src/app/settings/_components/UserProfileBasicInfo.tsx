"use client"

import profilePicPlaceholder from "@/assets/profile-pic-placeholder.png"
import { User } from "@prisma/client"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { use, useState } from "react"
import UserProfileDateItem from "./UserProfileDateItem"
import UserProfileSelectItem from "./UserProfileSelectItem"
import UserProfileTextItem from "./UserProfileTextItem"
import { format } from "date-fns"
import UserProfilePictureItem from "./UserProfilePictureItem"

const genders = [
    { label: "Female", value: "f" },
    { label: "Male", value: "m" },
    { label: "Rather not say", value: "n" },
]

export default function UserProfileBasicInfo({ user }: { user: User }) {
    const [usernameEditing, setUsernameEditing] = useState(false);
    const [dobEditing, setDobEditing] = useState(false);
    const [genderEditing, setGenderEditing] = useState(false);
    const [pictureEditing, setPictureEditing] = useState(false);

    return (
        <>
            {(!usernameEditing && !dobEditing && !genderEditing && !pictureEditing) &&

                <div className="flex flex-col">

                    <div className="px-4 pb-6">
                        <div className="text-lg font-medium">Basic info</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>

                    <div className="rounded-md flex items-center py-3 px-4 hover:bg-muted hover:cursor-pointer" onClick={() => setPictureEditing(true)}>
                        <div className="flex align-top w-full">
                            <div className="w-40 flex-shrink-0 text-sm font-medium leading-none">Profile picture</div>
                            <div className="w-full pe-4 text-sm leading-none">A profile picture helps personalize your account</div>
                        </div>
                        <Image
                            src={user.image || profilePicPlaceholder}
                            style={{ objectFit: "cover" }}
                            width={80}
                            height={80}
                            alt="preview image"
                            className="rounded-full h-16 w-16 flex-shrink-0"
                        />
                    </div>
                    <div className="rounded-md flex items-center py-4 px-4 hover:bg-muted hover:cursor-pointer" onClick={() => setUsernameEditing(true)}>
                        <div className="flex align-top w-full">
                            <div className="w-40 flex-shrink-0 text-sm font-medium leading-none">Username</div>
                            <div className="w-full pe-4 text-sm leading-none">{user.username ?? ""}</div>
                        </div>
                        <ChevronRight className="h-6 w-6 flex-shrink-0 me-2" />
                    </div>
                    <div className="rounded-md flex items-center py-4 px-4 hover:bg-muted hover:cursor-pointer" onClick={() => setDobEditing(true)}>
                        <div className="flex align-top w-full">
                            <div className="w-40 flex-shrink-0 text-sm font-medium leading-none">Date of birth</div>
                            <div className="w-full pe-4 text-sm leading-none">{user.dob ? format(user.dob, "PPP") : ""}</div>
                        </div>
                        <ChevronRight className="h-6 w-6 flex-shrink-0 me-2" />
                    </div>
                    <div className="rounded-md flex items-center py-4 px-4 hover:bg-muted hover:cursor-pointer" onClick={() => setGenderEditing(true)}>
                        <div className="flex align-top w-full">
                            <div className="w-40 flex-shrink-0 text-sm font-medium leading-none">Gender</div>
                            <div className="w-full pe-4 text-sm leading-none">{genders.find((item) => item.value === user.gender)?.label || ""}</div>
                        </div>
                        <ChevronRight className="h-6 w-6 flex-shrink-0 me-2" />
                    </div>

                </div>

            }
            {usernameEditing &&
                <UserProfileTextItem
                    userId={user.id}
                    fieldName="username"
                    label={"Username"}
                    value={user.username}
                    onClose={() => { setUsernameEditing(false) }}
                />
            }
            {dobEditing &&
                <UserProfileDateItem
                    userId={user.id}
                    fieldName="dob"
                    label={"Date of birth"}
                    value={user.dob}
                    onClose={() => { setDobEditing(false) }}
                />
            }
            {genderEditing &&
                <UserProfileSelectItem
                    userId={user.id}
                    fieldName="gender"
                    label={"Gender"}
                    possibileValues={genders}
                    currentValue={user.gender}
                    onClose={() => { setGenderEditing(false) }}
                />
            }
            {pictureEditing &&
                <UserProfilePictureItem
                    userId={user.id}
                    fieldName=""
                    label=""
                    value={user.image}
                    onClose={() => setPictureEditing(false)}
                />
            }
        </>
    )
}