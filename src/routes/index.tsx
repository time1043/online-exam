import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { Button } from '#/components/ui/button';
import { prisma } from '#/db';

const getTodos = createServerFn({ method: 'GET' }).handler(async () => {
  return prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
  });
});

export const Route = createFileRoute('/')({
  component: Home,
  loader: async () => {
    return { todos: await getTodos() };
  },
});

function Home() {
  const { todos } = Route.useLoaderData();

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
      <Button className="mt-4">Click me</Button>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Todos from Neon DB</h2>
        <ul className="mt-4 space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="rounded-md border p-3">
              {todo.title}
              <span className="ml-2 text-sm text-muted-foreground">
                ({todo.createdAt.toLocaleString()})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
