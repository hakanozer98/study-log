export interface StudyLog {
    id: string;
    user_id: string;
    category_id?: string;
    title: string;
    created_at: string;
    category?: Category;
    interval?: Interval[];
}

export interface Interval {
    id: string;
    study_log_id: string;
    user_id: string;
    is_study: boolean;
    start_time: string;
    end_time: string;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    icon_name: string;
}