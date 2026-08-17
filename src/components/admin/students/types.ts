export interface Course {
  id: number;
  title: string;
  fee?: number | null;
  discount_fee?: number | null;
}

export interface Batch {
  id: number;
  name: string;
  year?: string;
  course: Course;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  phone: string;
  email?: string | null;
  gender?: string | null;
  dob?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  address?: string | null;
  photo?: string | null;
  batch: Batch;
  status: string;
  enrolled_at: string;
}

export interface StudentsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
