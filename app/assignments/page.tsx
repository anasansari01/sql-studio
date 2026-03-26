"use client";

import { useEffect, useState } from "react";
import { AssignmentCard } from "@/components/assignment/assignmentCard";
import { BookOpen, AlertCircle } from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tables: unknown;
  createdAt: string;
}

const difficultyOrder = { easy: 0, medium: 1, hard: 2 };

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAssignments() {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

        const res = await fetch(`${baseUrl}/api/assignments`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setAssignments([]);
          return;
        }

        const data = await res.json();
        setAssignments(data.assignments ?? []);
      } catch (error) {
        console.error(error);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    }

    getAssignments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        Loading assignments...
      </div>
    );
  }

  const easy = assignments.filter((a) => a.difficulty === "easy");
  const medium = assignments.filter((a) => a.difficulty === "medium");
  const hard = assignments.filter((a) => a.difficulty === "hard");

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-indigo-600/20 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">SQL Assignments</h1>
        </div>
        <p className="text-[#8b949e] ml-12">
          {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}{" "}
          available — pick one to start coding
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-14 w-14 rounded-full bg-[#21262d] flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-[#484f58]" />
          </div>
          <div>
            <p className="text-[#8b949e] font-medium">No assignments found</p>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {[
            { label: "Easy", items: easy, color: "text-emerald-400" },
            { label: "Medium", items: medium, color: "text-amber-400" },
            { label: "Hard", items: hard, color: "text-red-400" },
          ]
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <section key={group.label}>
                <div className="flex items-center gap-3 mb-4">
                  <h2
                    className={`text-xs font-bold uppercase tracking-widest ${group.color}`}
                  >
                    {group.label}
                  </h2>
                  <div className="flex-1 h-px bg-[#21262d]" />
                  <span className="text-xs text-[#484f58]">
                    {group.items.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.items.map((assignment, i) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      index={
                        assignments
                          .sort(
                            (a, b) =>
                              difficultyOrder[a.difficulty] -
                              difficultyOrder[b.difficulty]
                          )
                          .indexOf(assignment)
                      }
                    />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}