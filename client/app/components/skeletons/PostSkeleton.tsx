import Skeleton from "react-loading-skeleton";

const PostSkeleton = () => {
  return (
    <div className={`card rounded-t-none w-full bg-base-100 h-[500px]`}>
      <figure className="w-full h-56">
        <Skeleton style={{ height: "250px", width: "420px" }} />
      </figure>
      <div className="card-body p-5">
        <Skeleton height="20px" width="50%" />
        <Skeleton height="20px" count={6} />
        <div className="grid grid-cols-[0.65fr_0.35fr] gap-2">
          <div className="flex flex-col text-xs">
            <Skeleton height="12px" width="50%" />
            <Skeleton height="12px" width="40%" />
          </div>
          <div className="flex items-center text-xs justify-self-end gap-1">
            <Skeleton circle height="26px" width="26px" />
            <Skeleton height="12px" width="50px" />
          </div>
        </div>
        <div className="card-actions justify-end">
          <Skeleton height="12px" width="100px" />
        </div>
      </div>
    </div>
  );
};
export default PostSkeleton;
