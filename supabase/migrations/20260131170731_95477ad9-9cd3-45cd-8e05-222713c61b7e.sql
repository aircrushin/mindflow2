-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles for username lookup"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Create cbt_sessions table for storing session history
CREATE TABLE public.cbt_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    custom_emotion TEXT,
    selected_emotion TEXT,
    emotion_intensity INTEGER CHECK (emotion_intensity >= 0 AND emotion_intensity <= 10),
    body_sensation TEXT,
    automatic_thought TEXT,
    detected_distortions TEXT[],
    ai_questions TEXT[],
    balanced_thought TEXT,
    selected_action TEXT
);

-- Enable RLS on cbt_sessions
ALTER TABLE public.cbt_sessions ENABLE ROW LEVEL SECURITY;

-- Sessions policies - users can only see their own records
CREATE POLICY "Users can view their own sessions"
ON public.cbt_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
ON public.cbt_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries by user and date
CREATE INDEX idx_cbt_sessions_user_date ON public.cbt_sessions(user_id, completed_at DESC);