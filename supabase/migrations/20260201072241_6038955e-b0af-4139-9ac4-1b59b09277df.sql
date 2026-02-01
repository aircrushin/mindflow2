-- 添加头像字段到 profiles 表
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 创建头像存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 允许所有人查看头像
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

-- 允许用户上传自己的头像
CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 允许用户更新自己的头像
CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 允许用户删除自己的头像
CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);