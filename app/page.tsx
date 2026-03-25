export default function Page() {
  return (
    <main className="flex flex-1">

      {/* Sidebar */}
      <aside className="w-64 border-r border-border p-4 space-y-4">
        <p className="text-xs uppercase tracking-wider text-muted">
          Queries
        </p>

        <div className="space-y-2 text-sm">
          <div className="px-3 py-2 rounded-md hover:bg-surface-elevated cursor-pointer">
            users.sql
          </div>
          <div className="px-3 py-2 rounded-md hover:bg-surface-elevated cursor-pointer">
            orders.sql
          </div>
        </div>
      </aside>

      {/* Editor Area */}
      <section className="flex-1 p-6">
        <div className="surface-elevated h-full flex flex-col">

          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm text-muted">
              Query Editor
            </p>

            <button className="button text-sm">
              Run Query
            </button>
          </div>

          {/* Code Area */}
          <div className="flex-1 p-4 overflow-auto">
            <pre>
              <code>
              {`SELECT *
FROM users
WHERE active = true
ORDER BY created_at DESC;`}
              </code>
            </pre>
          </div>

        </div>
      </section>

    </main>
  );
}