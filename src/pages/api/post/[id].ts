import { DeletedPostModel, PostModel } from "../../../db/models";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const id = req.query.id as string;

  if (req.method === "GET") {
    
    const post = await PostModel.findById(id);

    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404);
    }
  } else if (req.method === "PUT") {
    const body = JSON.parse(req.body);
    const post = await PostModel.findById(id);

    if (post) {
      const updateResult = await PostModel.updateMany(
        { _id: id },
        { $set: body }
      ).catch((err) => {
        console.error("Update Error:", err);
        res.status(500).json({ error: "Update Error" });
      });

      const updatedPost = await PostModel.findById(id);

      if (updatedPost) {
        res.status(200).json(updatedPost);
      }
    } else {
      res.status(404).send({ message: "Post not found" });
    }
  } else if (req.method === "DELETE") {
    try {
      const post = await PostModel.findById(id);

      if (post) {
        const postObject = post.toObject();
        const deletedPost = new DeletedPostModel({
          ...postObject,
          deletedAt: new Date(),
        });

        await deletedPost.save();

        await PostModel.findByIdAndRemove(id);

        res.status(200).json({ message: "Post successfully deleted" });
      } else {
        res.status(404).send({ message: "Post not found" });
      }
    } catch (err) {
      console.error("Delete Error:", err);
      res.status(500).json({ error: "Delete Error" });
    }
  }
}
