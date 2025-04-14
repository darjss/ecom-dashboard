import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const hello = await api.cart.hello({ text: "fjiowf ewomf" });

  // void api.cart.getLatest.prefetch();

  return (
    <HydrateClient>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-black">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>
          </div>
    </HydrateClient>
  );
}
