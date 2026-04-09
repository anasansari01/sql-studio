import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { assignments, categories, assignmentCategories } from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool);

// ─── Sandbox schemas ──────────────────────────────────────────────────────────

async function createEcommerceSandbox(pool: Pool) {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS assignment_ecommerce;
    CREATE TABLE IF NOT EXISTS assignment_ecommerce.customers (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
      city TEXT NOT NULL, joined_at DATE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignment_ecommerce.products (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL, stock INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignment_ecommerce.orders (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES assignment_ecommerce.customers(id),
      product_id INTEGER REFERENCES assignment_ecommerce.products(id),
      quantity INTEGER NOT NULL, total_amount NUMERIC(10,2) NOT NULL,
      ordered_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    TRUNCATE assignment_ecommerce.orders, assignment_ecommerce.products, assignment_ecommerce.customers RESTART IDENTITY CASCADE;
    INSERT INTO assignment_ecommerce.customers (name, email, city, joined_at) VALUES
      ('Alice Johnson','alice@example.com','New York','2023-01-15'),
      ('Bob Smith','bob@example.com','Los Angeles','2023-02-20'),
      ('Carol White','carol@example.com','Chicago','2023-03-10'),
      ('David Brown','david@example.com','New York','2023-04-05'),
      ('Emma Davis','emma@example.com','Houston','2023-05-18');
    INSERT INTO assignment_ecommerce.products (name, category, price, stock) VALUES
      ('Laptop Pro 15','Electronics',1299.99,50),('Wireless Mouse','Electronics',29.99,200),
      ('USB-C Hub','Electronics',49.99,150),('Desk Chair','Furniture',299.99,30),
      ('Standing Desk','Furniture',599.99,20),('Python Book','Books',39.99,100),
      ('SQL Mastery','Books',34.99,80);
    INSERT INTO assignment_ecommerce.orders (customer_id, product_id, quantity, total_amount, ordered_at) VALUES
      (1,1,1,1299.99,'2024-01-10 10:00:00'),(1,2,2,59.98,'2024-01-12 11:00:00'),
      (2,3,1,49.99,'2024-01-15 09:30:00'),(3,4,1,299.99,'2024-01-20 14:00:00'),
      (3,6,1,39.99,'2024-01-22 16:00:00'),(4,1,1,1299.99,'2024-02-01 10:00:00'),
      (4,5,1,599.99,'2024-02-05 12:00:00'),(5,7,2,69.98,'2024-02-10 15:00:00'),
      (2,2,3,89.97,'2024-02-15 13:00:00'),(1,7,1,34.99,'2024-02-20 11:00:00');
  `);
  console.log("✅ Ecommerce sandbox created");
}

async function createHrSandbox(pool: Pool) {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS assignment_hr;
    CREATE TABLE IF NOT EXISTS assignment_hr.departments (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, budget NUMERIC(12,2) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignment_hr.employees (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL,
      department_id INTEGER REFERENCES assignment_hr.departments(id),
      salary NUMERIC(10,2) NOT NULL, hire_date DATE NOT NULL,
      manager_id INTEGER REFERENCES assignment_hr.employees(id)
    );
    TRUNCATE assignment_hr.employees, assignment_hr.departments RESTART IDENTITY CASCADE;
    INSERT INTO assignment_hr.departments (name, budget) VALUES
      ('Engineering',2000000),('Marketing',800000),('Sales',1200000),
      ('HR',500000),('Finance',700000);
    INSERT INTO assignment_hr.employees (name, department_id, salary, hire_date, manager_id) VALUES
      ('Sarah Connor',1,120000,'2019-03-01',NULL),('John Reese',1,95000,'2020-06-15',1),
      ('Mary Jane',1,88000,'2021-01-10',1),('Peter Parker',2,72000,'2020-09-01',NULL),
      ('Tony Stark',2,85000,'2019-11-20',4),('Steve Rogers',3,90000,'2018-07-04',NULL),
      ('Natasha Romanova',3,82000,'2021-03-15',6),('Bruce Banner',4,68000,'2022-01-05',NULL),
      ('Clint Barton',5,95000,'2019-05-20',NULL),('Wanda Maximoff',1,105000,'2020-08-01',1);
  `);
  console.log("✅ HR sandbox created");
}

async function createSchoolSandbox(pool: Pool) {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS assignment_school;
    CREATE TABLE IF NOT EXISTS assignment_school.students (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, grade_level INTEGER NOT NULL,
      enrollment_date DATE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignment_school.courses (
      id SERIAL PRIMARY KEY, name TEXT NOT NULL, credits INTEGER NOT NULL,
      instructor TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assignment_school.enrollments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES assignment_school.students(id),
      course_id INTEGER REFERENCES assignment_school.courses(id),
      grade NUMERIC(4,2), semester TEXT NOT NULL
    );
    TRUNCATE assignment_school.enrollments, assignment_school.courses, assignment_school.students RESTART IDENTITY CASCADE;
    INSERT INTO assignment_school.students (name, grade_level, enrollment_date) VALUES
      ('Hermione Granger',3,'2022-09-01'),('Harry Potter',3,'2022-09-01'),
      ('Ron Weasley',3,'2022-09-01'),('Luna Lovegood',2,'2023-01-15'),
      ('Draco Malfoy',3,'2022-09-01'),('Neville Longbottom',3,'2022-09-01');
    INSERT INTO assignment_school.courses (name, credits, instructor) VALUES
      ('Database Systems',4,'Prof. Dumbledore'),('Algorithms',3,'Prof. McGonagall'),
      ('Web Development',3,'Prof. Snape'),('Machine Learning',4,'Prof. Dumbledore'),
      ('Data Structures',3,'Prof. McGonagall');
    INSERT INTO assignment_school.enrollments (student_id, course_id, grade, semester) VALUES
      (1,1,4.0,'Fall 2023'),(1,2,3.7,'Fall 2023'),(1,4,3.9,'Spring 2024'),
      (2,1,3.2,'Fall 2023'),(2,3,3.5,'Fall 2023'),(3,1,2.8,'Fall 2023'),
      (3,5,3.0,'Spring 2024'),(4,2,3.8,'Fall 2023'),(4,3,3.6,'Fall 2023'),
      (5,1,3.1,'Fall 2023'),(6,4,3.4,'Spring 2024'),(6,5,3.2,'Spring 2024');
  `);
  console.log("✅ School sandbox created");
}

// ─── Categories ───────────────────────────────────────────────────────────────

async function seedCategories() {
  // TRUNCATE with CASCADE guarantees clean slate regardless of FK order
  await pool.query(`
    TRUNCATE TABLE
      assignment_categories,
      solved_assignments,
      attempts,
      assignments,
      categories
    RESTART IDENTITY CASCADE
  `);

  const rows = await db.insert(categories).values([
    {
      slug: "top-50-interview",
      name: "Top 50 SQL Interview",
      description: "The 50 most commonly asked SQL questions in technical interviews at top companies.",
      icon: "Trophy",
      color: "amber",
      displayOrder: 1,
    },
    {
      slug: "neetcode-150",
      name: "NeetCode 150",
      description: "Curated SQL problems from the NeetCode 150 list — structured for systematic preparation.",
      icon: "Zap",
      color: "indigo",
      displayOrder: 2,
    },
    {
      slug: "aggregations",
      name: "Aggregations & Grouping",
      description: "Master GROUP BY, HAVING, COUNT, SUM, AVG, MIN, MAX and aggregate patterns.",
      icon: "BarChart2",
      color: "emerald",
      displayOrder: 3,
    },
    {
      slug: "joins",
      name: "JOINs",
      description: "Practice INNER JOIN, LEFT JOIN, self-joins, and multi-table query patterns.",
      icon: "GitMerge",
      color: "sky",
      displayOrder: 4,
    },
    {
      slug: "window-functions",
      name: "Window Functions",
      description: "ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, and advanced analytical queries.",
      icon: "Layers",
      color: "purple",
      displayOrder: 5,
    },
    {
      slug: "subqueries",
      name: "Subqueries & CTEs",
      description: "Correlated subqueries, EXISTS, IN, and WITH clauses for complex data retrieval.",
      icon: "Code2",
      color: "rose",
      displayOrder: 6,
    },
  ]).returning();

  console.log("✅ Categories seeded:", rows.map((r) => r.slug).join(", "));
  return rows;
}

// ─── Assignments ──────────────────────────────────────────────────────────────

async function seedAssignments(cats: typeof categories.$inferSelect[]) {
  // assignments already cleared by the TRUNCATE in seedCategories()

  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

  const rows = await db.insert(assignments).values([
    // ── 1. Top Customers by Spending ──────────────────────────────────────────
    {
      title: "Top Customers by Spending",
      description: "Query customer orders to find who has spent the most. Practice JOINs and aggregation.",
      difficulty: "easy" as const,
      question: `Find the top 3 customers by total spending.\nReturn their name, email, city, and total_spent (sum of all their order amounts).\nOrder the results by total_spent descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email, city, total_spent",
      solutionQuery: `
        SELECT c.name, c.email, c.city, SUM(o.total_amount) AS total_spent
        FROM customers c
        JOIN orders o ON c.id = o.customer_id
        GROUP BY c.id, c.name, c.email, c.city
        ORDER BY total_spent DESC
        LIMIT 3
      `,
    },
    // ── 2. Products Never Ordered ─────────────────────────────────────────────
    {
      title: "Products Never Ordered",
      description: "Use LEFT JOIN or NOT IN to find products with no orders. Classic set-difference pattern.",
      difficulty: "medium" as const,
      question: `Find all products that have never been ordered.\nReturn the product name, category, and price.\nOrder by category, then by name.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["products", "orders"],
      expectedColumns: "name, category, price",
      solutionQuery: `
        SELECT p.name, p.category, p.price
        FROM products p
        LEFT JOIN orders o ON p.id = o.product_id
        WHERE o.id IS NULL
        ORDER BY p.category, p.name
      `,
    },
    // ── 3. Monthly Revenue Report ─────────────────────────────────────────────
    {
      title: "Monthly Revenue Report",
      description: "Aggregate orders by month. Practice date functions and GROUP BY.",
      difficulty: "medium" as const,
      question: `Calculate total revenue per month.\nReturn the year, month number, and total_revenue (sum of total_amount).\nOnly include months where revenue exceeds 500.\nOrder by year and month ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "year, month, total_revenue",
      solutionQuery: `
        SELECT
          EXTRACT(YEAR FROM ordered_at)::INTEGER AS year,
          EXTRACT(MONTH FROM ordered_at)::INTEGER AS month,
          SUM(total_amount) AS total_revenue
        FROM orders
        GROUP BY year, month
        HAVING SUM(total_amount) > 500
        ORDER BY year, month
      `,
    },
    // ── 4. Highest Paid per Department ────────────────────────────────────────
    {
      title: "Highest Paid Employees per Department",
      description: "Use DISTINCT ON or subqueries to find the top earner in each department.",
      difficulty: "hard" as const,
      question: `For each department, find the employee with the highest salary.\nReturn the department name, employee name, and their salary.\nOrder by salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, employee_name, salary",
      solutionQuery: `
        SELECT DISTINCT ON (d.id)
          d.name AS department_name,
          e.name AS employee_name,
          e.salary
        FROM employees e
        JOIN departments d ON e.department_id = d.id
        ORDER BY d.id, e.salary DESC
      `,
    },
    // ── 5. Average Salary by Department ──────────────────────────────────────
    {
      title: "Average Salary by Department",
      description: "Simple GROUP BY with aggregation. Great for beginners.",
      difficulty: "easy" as const,
      question: `Calculate the average salary for each department.\nReturn the department name and avg_salary rounded to 2 decimal places.\nOnly include departments with more than 1 employee.\nOrder by avg_salary descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, avg_salary",
      solutionQuery: `
        SELECT d.name AS department_name, ROUND(AVG(e.salary), 2) AS avg_salary
        FROM employees e
        JOIN departments d ON e.department_id = d.id
        GROUP BY d.id, d.name
        HAVING COUNT(e.id) > 1
        ORDER BY avg_salary DESC
      `,
    },
    // ── 6. Students with GPA above 3.5 ────────────────────────────────────────
    {
      title: "Students with GPA above 3.5",
      description: "Calculate GPA across multiple enrollments. Multi-table aggregation with HAVING.",
      difficulty: "medium" as const,
      question: `Find all students whose average grade across all enrolled courses is above 3.5.\nReturn student name, grade_level, and their gpa (average grade rounded to 2 decimals).\nOrder by gpa descending.`,
      sandboxSchema: "assignment_school",
      tables: ["students", "enrollments"],
      expectedColumns: "name, grade_level, gpa",
      solutionQuery: `
        SELECT s.name, s.grade_level, ROUND(AVG(e.grade), 2) AS gpa
        FROM students s
        JOIN enrollments e ON s.id = e.student_id
        GROUP BY s.id, s.name, s.grade_level
        HAVING AVG(e.grade) > 3.5
        ORDER BY gpa DESC
      `,
    },
    // ── 7. Department Budget Utilization ─────────────────────────────────────
    {
      title: "Department Budget Utilization",
      description: "Calculate what percentage of each department's budget is used by total salaries.",
      difficulty: "medium" as const,
      question: `For each department, calculate total salary spend and the percentage of the budget used.\nReturn department name, total_salary, budget, and utilization_pct (rounded to 1 decimal).\nOrder by utilization_pct descending.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "department_name, total_salary, budget, utilization_pct",
      solutionQuery: `
        SELECT
          d.name AS department_name,
          SUM(e.salary) AS total_salary,
          d.budget,
          ROUND((SUM(e.salary) / d.budget * 100)::NUMERIC, 1) AS utilization_pct
        FROM employees e
        JOIN departments d ON e.department_id = d.id
        GROUP BY d.id, d.name, d.budget
        ORDER BY utilization_pct DESC
      `,
    },
    // ── 8. Revenue by Product Category ───────────────────────────────────────
    {
      title: "Revenue by Product Category",
      description: "Join orders and products to see which category drives the most revenue.",
      difficulty: "easy" as const,
      question: `Calculate total revenue for each product category.\nReturn category and total_revenue (sum of order total_amounts for products in that category).\nOrder by total_revenue descending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders", "products"],
      expectedColumns: "category, total_revenue",
      solutionQuery: `
        SELECT p.category, SUM(o.total_amount) AS total_revenue
        FROM orders o
        JOIN products p ON o.product_id = p.id
        GROUP BY p.category
        ORDER BY total_revenue DESC
      `,
    },
    // ── 9. Employee Rank by Salary within Department ──────────────────────────
    {
      title: "Employee Salary Rank within Department",
      description: "Use RANK() window function to rank employees by salary inside each department.",
      difficulty: "hard" as const,
      question: `Rank each employee by salary within their department (highest = rank 1).\nReturn employee name, department name, salary, and salary_rank.\nOrder by department name, then salary_rank.`,
      sandboxSchema: "assignment_hr",
      tables: ["employees", "departments"],
      expectedColumns: "employee_name, department_name, salary, salary_rank",
      solutionQuery: `
        SELECT
          e.name AS employee_name,
          d.name AS department_name,
          e.salary,
          RANK() OVER (PARTITION BY d.id ORDER BY e.salary DESC) AS salary_rank
        FROM employees e
        JOIN departments d ON e.department_id = d.id
        ORDER BY d.name, salary_rank
      `,
    },
    // ── 10. Customers with Multiple Orders ────────────────────────────────────
    {
      title: "Customers with Multiple Orders",
      description: "Find customers who have placed more than one order. HAVING clause practice.",
      difficulty: "easy" as const,
      question: `Find all customers who have placed more than 1 order.\nReturn their name, email, and order_count.\nOrder by order_count descending, then name ascending.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["customers", "orders"],
      expectedColumns: "name, email, order_count",
      solutionQuery: `
        SELECT c.name, c.email, COUNT(o.id) AS order_count
        FROM customers c
        JOIN orders o ON c.id = o.customer_id
        GROUP BY c.id, c.name, c.email
        HAVING COUNT(o.id) > 1
        ORDER BY order_count DESC, c.name ASC
      `,
    },
    // ── 11. Course Enrollment Count ───────────────────────────────────────────
    {
      title: "Course Enrollment Count",
      description: "Count how many students are enrolled in each course.",
      difficulty: "easy" as const,
      question: `For each course, count how many students are enrolled.\nReturn the course name, instructor, and enrollment_count.\nOrder by enrollment_count descending.`,
      sandboxSchema: "assignment_school",
      tables: ["courses", "enrollments"],
      expectedColumns: "name, instructor, enrollment_count",
      solutionQuery: `
        SELECT c.name, c.instructor, COUNT(e.student_id) AS enrollment_count
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        GROUP BY c.id, c.name, c.instructor
        ORDER BY enrollment_count DESC
      `,
    },
    // ── 12. Running Total Revenue ─────────────────────────────────────────────
    {
      title: "Running Total Order Revenue",
      description: "Use a window function to compute a running total of revenue across all orders.",
      difficulty: "hard" as const,
      question: `Calculate a running total of revenue ordered by order date.\nReturn order id, ordered_at (date only), total_amount, and running_total.\nOrder by ordered_at, then id.`,
      sandboxSchema: "assignment_ecommerce",
      tables: ["orders"],
      expectedColumns: "id, ordered_at, total_amount, running_total",
      solutionQuery: `
        SELECT
          id,
          ordered_at::DATE AS ordered_at,
          total_amount,
          SUM(total_amount) OVER (ORDER BY ordered_at, id) AS running_total
        FROM orders
        ORDER BY ordered_at, id
      `,
    },
  ]).returning();

  console.log("✅ Assignments seeded:", rows.length);

  // ── Assign to categories ───────────────────────────────────────────────────
  const byTitle = Object.fromEntries(rows.map((r) => [r.title, r.id]));

  // Each array defines the sequential order of questions within that category.
  // Position is the index — question 0 comes first, 1 second, etc.
  const categoryMappings: Record<string, string[]> = {
    "top-50-interview": [
      "Top Customers by Spending",
      "Products Never Ordered",
      "Average Salary by Department",
      "Customers with Multiple Orders",
      "Revenue by Product Category",
      "Course Enrollment Count",
      "Department Budget Utilization",
      "Highest Paid Employees per Department",
    ],
    "neetcode-150": [
      "Top Customers by Spending",
      "Products Never Ordered",
      "Monthly Revenue Report",
      "Students with GPA above 3.5",
      "Employee Salary Rank within Department",
      "Running Total Order Revenue",
    ],
    "aggregations": [
      "Top Customers by Spending",
      "Monthly Revenue Report",
      "Average Salary by Department",
      "Department Budget Utilization",
      "Revenue by Product Category",
      "Customers with Multiple Orders",
      "Course Enrollment Count",
      "Students with GPA above 3.5",
    ],
    "joins": [
      "Top Customers by Spending",
      "Products Never Ordered",
      "Highest Paid Employees per Department",
      "Average Salary by Department",
      "Revenue by Product Category",
      "Department Budget Utilization",
      "Employee Salary Rank within Department",
      "Course Enrollment Count",
    ],
    "window-functions": [
      "Employee Salary Rank within Department",
      "Highest Paid Employees per Department",
      "Running Total Order Revenue",
    ],
    "subqueries": [
      "Products Never Ordered",
      "Highest Paid Employees per Department",
      "Students with GPA above 3.5",
    ],
  };

  const validMappings: { assignmentId: string; categoryId: string; position: number }[] = [];

  for (const [slug, titles] of Object.entries(categoryMappings)) {
    const catId = catBySlug[slug];
    if (!catId) continue;
    titles.forEach((title, position) => {
      const assignmentId = byTitle[title];
      if (assignmentId) {
        validMappings.push({ assignmentId, categoryId: catId, position });
      }
    });
  }

  await db.insert(assignmentCategories).values(validMappings);
  console.log("✅ Assignment-category mappings created:", validMappings.length);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    console.log("🌱 Starting seed...");
    await createEcommerceSandbox(pool);
    await createHrSandbox(pool);
    await createSchoolSandbox(pool);
    const cats = await seedCategories();
    await seedAssignments(cats);
    console.log("🎉 Seed complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();