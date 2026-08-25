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

export interface StudentPayment {
  id: number;
  student_id: number;
  amount: number;
  discount: number;
  due_amount: number;
  month: number;
  year: number;
  status: string;
  payment_type?: string | null;
  invoice?: string | null;
  receipt_number?: string | null;
  paid_at?: string | null;
  note?: string | null;
  created_at: string;
}
