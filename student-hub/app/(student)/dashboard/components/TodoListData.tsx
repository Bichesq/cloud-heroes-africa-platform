import { getTodos } from "@/lib/todos";
import TodoList from "./TodoList";

export default async function TodoListData({
  studentId,
  now,
}: {
  studentId: string | undefined;
  now: string;
}) {
  const todos = studentId ? await getTodos(studentId) : [];
  return <TodoList initialTodos={todos} now={now} />;
}
