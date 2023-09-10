import { DeletedPost } from "./deletedPostModel";
import { DeletedUserPhoto } from "./deletedUserPhotosModel";
import { Post } from "./postModel";
import { getModelForClass } from "@typegoose/typegoose";

export const PostModel = getModelForClass(Post);
export const DeletedPostModel = getModelForClass(DeletedPost);
export const DeletedUserPhotoModel = getModelForClass(DeletedUserPhoto);

// add other models here