import { useState, useRef, useEffect } from 'react'

interface Todo {
  id: string
  text: string
  done: boolean
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: inputValue.trim(),
        done: false,
      }
      setTodos((prev) => [...prev, newTodo])
      setInputValue('')
    }
  }

  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    )
  }

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const handleSaveEdit = (id: string) => {
    if (editText.trim()) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, text: editText.trim() } : todo
        )
      )
    }
    setEditingId(null)
    setEditText('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id)
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#e4e4e7] tracking-tight font-mono">
            TAREFAS
          </h1>
          <div className="h-1 w-16 bg-[#10b981] mt-2" />
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleAdd}
            placeholder="Nova tarefa..."
            className="w-full bg-[#18181b] border border-[#27272a] text-[#e4e4e7] placeholder-[#52525b] px-4 py-3 text-base focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
          />
          <p className="text-xs text-[#52525b] mt-2 font-mono">
            Pressione ENTER para adicionar
          </p>
        </div>

        <div className="space-y-2">
          {todos.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[#52525b] text-lg font-mono">
                Nenhuma tarefa ainda
              </p>
              <p className="text-[#3f3f46] text-sm mt-2">
                Adicione sua primeira tarefa acima
              </p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-center gap-3 bg-[#18181b] border border-[#27272a] px-4 py-3 hover:border-[#3f3f46] transition-colors ${
                  todo.done ? 'opacity-60' : ''
                }`}
              >
                <button
                  onClick={() => handleToggle(todo.id)}
                  className={`flex-shrink-0 w-5 h-5 border-2 flex items-center justify-center transition-colors ${
                    todo.done
                      ? 'bg-[#10b981] border-[#10b981]'
                      : 'border-[#52525b] hover:border-[#10b981]'
                  }`}
                  aria-label={todo.done ? 'Marcar como não concluída' : 'Marcar como concluída'}
                >
                  {todo.done && (
                    <svg
                      className="w-3 h-3 text-[#0a0a0b]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {editingId === todo.id ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleEditKeyDown(e, todo.id)}
                    onBlur={() => handleSaveEdit(todo.id)}
                    className="flex-1 bg-[#0a0a0b] border border-[#10b981] text-[#e4e4e7] px-2 py-1 text-base focus:outline-none"
                  />
                ) : (
                  <span
                    onClick={() => handleStartEdit(todo)}
                    className={`flex-1 cursor-text ${
                      todo.done
                        ? 'line-through text-[#52525b]'
                        : 'text-[#e4e4e7] hover:text-[#10b981]'
                    } transition-colors`}
                    title="Clique para editar"
                  >
                    {todo.text}
                  </span>
                )}

                <button
                  onClick={() => handleDelete(todo.id)}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#52525b] hover:text-[#ef4444] hover:bg-[#27272a] transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Excluir tarefa"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {todos.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#27272a]">
            <p className="text-xs text-[#52525b] font-mono">
              {todos.filter((t) => t.done).length} de {todos.length} concluídas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
