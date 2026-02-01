-- 删除旧的限制性策略
DROP POLICY IF EXISTS "Users can view all profiles for username lookup" ON public.profiles;

-- 创建新的宽松策略，允许所有人查询（用于用户名登录查找）
CREATE POLICY "Anyone can view profiles for username lookup" 
ON public.profiles 
FOR SELECT 
USING (true);