export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-6 font-sans dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
        Growth App
      </h1>
      <p className="max-w-md text-center text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        The app is being built. Check the database status at{" "}
        <a
          href="/health/db"
          className="font-medium text-zinc-950 underline dark:text-zinc-50"
        >
          /health/db
        </a>
        .
      </p>
    </main>
  );
}
