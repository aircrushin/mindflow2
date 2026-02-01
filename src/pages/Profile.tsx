import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Camera, User, Lock, Save, Loader2 } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(profile?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '错误',
        description: '请上传图片文件',
        variant: 'destructive',
      });
      return;
    }

    // 验证文件大小 (最大 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: '错误',
        description: '图片大小不能超过 2MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // 删除旧头像
      await supabase.storage.from('avatars').remove([`${user.id}/avatar.png`, `${user.id}/avatar.jpg`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`]);

      // 上传新头像
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 添加时间戳防止缓存
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // 更新数据库
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlWithTimestamp })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(urlWithTimestamp);

      toast({
        title: '成功',
        description: '头像已更新',
      });
    } catch (error: any) {
      toast({
        title: '上传失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      toast({
        title: '错误',
        description: '用户名不能为空',
        variant: 'destructive',
      });
      return;
    }

    if (username.length < 2 || username.length > 20) {
      toast({
        title: '错误',
        description: '用户名长度需要在 2-20 个字符之间',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingProfile(true);

    try {
      // 检查用户名是否已被使用
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        toast({
          title: '错误',
          description: '该用户名已被使用',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: '成功',
        description: '用户名已更新',
      });
    } catch (error: any) {
      toast({
        title: '更新失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: '错误',
        description: '请填写新密码',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: '错误',
        description: '密码长度至少 6 个字符',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: '错误',
        description: '两次输入的密码不一致',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast({
        title: '成功',
        description: '密码已更新',
      });
    } catch (error: any) {
      toast({
        title: '修改失败',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage/5 to-lavender/5">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        <h1 className="text-2xl font-semibold text-foreground mb-6">个人资料</h1>

        <div className="space-y-6">
          {/* 头像设置 */}
          <Card className="rounded-2xl border-sage/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="w-5 h-5 text-sage" />
                头像
              </CardTitle>
              <CardDescription>点击头像更换新照片</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="relative w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-sage/50 transition-all disabled:opacity-50"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="头像"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-sage" />
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </button>
                <div className="text-sm text-muted-foreground">
                  <p>支持 JPG、PNG、WebP 格式</p>
                  <p>最大 2MB</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* 用户名设置 */}
          <Card className="rounded-2xl border-sage/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-sage" />
                用户名
              </CardTitle>
              <CardDescription>用于登录和显示的名称</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="输入新用户名"
                  className="rounded-xl"
                  maxLength={20}
                />
              </div>
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdatingProfile || username === profile?.username}
                className="rounded-xl bg-sage hover:bg-sage/90"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                保存用户名
              </Button>
            </CardContent>
          </Card>

          {/* 密码设置 */}
          <Card className="rounded-2xl border-sage/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-sage" />
                修改密码
              </CardTitle>
              <CardDescription>更新您的登录密码</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="输入新密码"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入新密码"
                  className="rounded-xl"
                />
              </div>
              <Button
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                className="rounded-xl bg-sage hover:bg-sage/90"
              >
                {isUpdatingPassword ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                修改密码
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
