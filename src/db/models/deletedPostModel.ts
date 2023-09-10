import { prop } from "@typegoose/typegoose";
import { Post } from "./postModel";

export class DeletedPost extends Post {
  @prop({ default: () => new Date() })
  deletedAt: Date;
}
