import { PostModel } from "../../../db/models";
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../db/dbConnect";
import { PostFormInputs } from "@/types";
import { generateSlug } from "@/utils/formHelpers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "GET") {
    const { tags, page } = req.query;
    const perPage = 10;
    const skip = page ? parseInt(page as string) * perPage : 0;

    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      const regexPatterns = tagsArray.map((tag) => new RegExp(`^${tag}`, "i"));

      const response = await PostModel.find({
        tags: { $in: regexPatterns },
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean();

      res.status(200).json(response);
    } else {
      const response = await PostModel.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean();
      res.status(200).json(response);
    }
  } else if (req.method === "POST") {
    const { text, photo, length, tags, authorId, authorName, links, title } =
      JSON.parse(req.body) as PostFormInputs;

    let baseSlug = generateSlug(JSON.parse(req.body), 35, 50);
    let slug = baseSlug;

    let counter = 1;

    while (await PostModel.exists({ urlSlug: slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const post = new PostModel({
      title: title || "",
      text: text || "",
      photo: photo,
      length: length,
      tags: tags,
      links: links,
      authorId: authorId,
      authorName: authorName,
      urlSlug: slug,
    });

    await post.save();

    res.status(200).json(post.toJSON());
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
