import dbConnect from '@/db/dbConnect';
import { PostModel } from '@/db/models';
import { PostFormInputs } from '@/types';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { FunctionComponent } from 'react';

interface PostPageProps {
  postData: PostFormInputs | null;
}

const PostPage: FunctionComponent<PostPageProps> = ({ postData }) => {
  if (!postData) {
    return <div>post not found</div>;
  }

  return (
    <>
      <div className="border flex justify-center items-center">
        <Link className="text-xs" href="/">Volver</Link>
        <h1 className="text-xl text-center font-bold m-4">Nota</h1>
      </div>

      <div>
        <div key={postData._id}>
          <p>{postData._id}</p>
        </div>
      </div>
    </>
  );
};

export default PostPage;

export const getServerSideProps: GetServerSideProps<PostPageProps> = async (context: GetServerSidePropsContext) => {
  try {
    await dbConnect();

    const { id } = context.query;

    let post;

    if (id!.length !== 9) {
      post = await PostModel.findOne({ urlSlug: id }).lean();
    } else {
      post = await PostModel.findById(id).lean();
    }

    if (!post) {
      return {
        notFound: true,
      };
    }

    const postData = {
      _id: post._id,
      urlSlug: post.urlSlug || "",
      mainText: post.text,
      length: post.length,
      photo: post.photo,
      createdAt: post.createdAt.toISOString(),
      tags: post.tags || [],
      authorId: post.authorId || '',
      authorName: post.authorName || '',
      links: post.links,
    };

    return {
      props: {
        postData,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      notFound: true,
    };
  }
};
