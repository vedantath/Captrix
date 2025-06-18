import VideoDetailHeader from "@/components/VideoDetailHeader";
import VideoPlayer from "@/components/VideoPlayer";
import { getVideoById } from "@/lib/actions/video";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";


const page = async ( { params }: Params) => {
  // const router = useRouter();
  const { data: session } = authClient.useSession();
  const clientUserId = session?.user.id;

  const { videoId } = await params;
  const { user, video } = await getVideoById(videoId);
  const { visibility } = video;
  if (!video || (visibility === 'private' && clientUserId !== video.userId)) {
    redirect('/404');
  }

  return (
    <main className='wrapper page'>
      <VideoDetailHeader {...video} userImg={user?.image} username={user?.name} ownerId={video.userId}/>

      <section className="video-details">
        <div className="content">
          <VideoPlayer videoId={video.videoId} />
        </div>
      </section>
    </main>
  )
}

export default page