import { notFound } from "next/navigation";
import { db } from "@/db/client";
import {
  categories,
  assignmentCategories,
  assignments,
  solvedAssignments,
} from "@/db/schema";
import { eq, and, inArray, asc } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { CategoryProblemsClient } from "@/components/categories/categoryProblemClient";

export interface CategoryProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  tables: string[];
  position: number;
  solved: boolean;
}

export interface CategoryDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

async function getCategoryData(slug: string): Promise<{
  category: CategoryDetail;
  problems: CategoryProblem[];
  totalSolved: number;
} | null> {
  const [cat] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!cat) return null;

  const links = await db
    .select({
      assignmentId: assignmentCategories.assignmentId,
      position: assignmentCategories.position,
    })
    .from(assignmentCategories)
    .where(eq(assignmentCategories.categoryId, cat.id))
    .orderBy(asc(assignmentCategories.position));

  if (links.length === 0) {
    return {
      category: {
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
      },
      problems: [],
      totalSolved: 0,
    };
  }

  const assignmentIds = links.map((l) => l.assignmentId);

  const rows = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      difficulty: assignments.difficulty,
      tables: assignments.tables,
    })
    .from(assignments)
    .where(inArray(assignments.id, assignmentIds));

  const user = await getSession();
  let solvedSet = new Set<string>();

  if (user) {
    const solved = await db
      .select({ assignmentId: solvedAssignments.assignmentId })
      .from(solvedAssignments)
      .where(
        and(
          eq(solvedAssignments.userId, user.id),
          inArray(solvedAssignments.assignmentId, assignmentIds)
        )
      );
    solvedSet = new Set(solved.map((s) => s.assignmentId));
  }

  const posMap = Object.fromEntries(
    links.map((l) => [l.assignmentId, l.position])
  );

  const problems: CategoryProblem[] = rows
    .map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      difficulty: a.difficulty,
      tables: (a.tables as string[]) ?? [],
      position: posMap[a.id] ?? 0,
      solved: solvedSet.has(a.id),
    }))
    .sort((a, b) => a.position - b.position);

  return {
    category: {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
    },
    problems,
    totalSolved: solvedSet.size,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) return { title: "Not found — SQL Studio" };
  return {
    title: `${data.category.name} — SQL Studio`,
    description: data.category.description,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryData(slug);

  if (!data) notFound();

  return (
    <CategoryProblemsClient
      category={data.category}
      problems={data.problems}
      totalSolved={data.totalSolved}
    />
  );
}