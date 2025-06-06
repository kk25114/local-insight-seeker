import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleTestLogin = async () => {
    setIsLoading(true);
    try {
      // 使用测试凭据
      const testEmail = 'test@example.com';
      const testPassword = 'test123456';
      
      console.log('尝试测试登录:', { email: testEmail });
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      console.log('测试登录结果:', { data, error });

      if (error) {
        // 如果测试用户不存在，先注册
        if (error.message.includes('Invalid login credentials')) {
          console.log('测试用户不存在，尝试注册...');
          const { error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
          });
          
          if (signUpError) {
            throw signUpError;
          }
          
          toast({
            title: "测试用户已创建",
            description: "请使用 test@example.com / test123456 登录",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "测试登录成功",
        description: "认证系统工作正常",
      });
    } catch (error: any) {
      console.error('测试登录错误:', error);
      toast({
        title: "测试登录失败",
        description: error.message || "认证系统可能有问题",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast({
        title: "请填写完整信息",
        description: "邮箱和密码都是必填项",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "注册成功",
        description: "请检查您的邮箱确认账户",
      });
    } catch (error: any) {
      toast({
        title: "注册失败",
        description: error.message || "注册过程中出现错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "请填写完整信息",
        description: "邮箱和密码都是必填项",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('尝试登录:', { email, password: '***' });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('登录结果:', { data, error });

      if (error) {
        throw error;
      }

      toast({
        title: "登录成功",
        description: "欢迎使用 SPSS AI",
      });
    } catch (error: any) {
      console.error('登录错误详情:', error);
      toast({
        title: "登录失败",
        description: error.message || "登录过程中出现错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">SPSS AI</CardTitle>
          <CardDescription>统计科学 — 点就好</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="请输入邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                onClick={handleSignIn} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
              <Button 
                onClick={handleTestLogin} 
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                测试登录系统
              </Button>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="请输入邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="请输入密码 (至少6位)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <AlertCircle className="h-4 w-4 mt-0.5 text-blue-500" />
                <div>
                  <p>注册后默认为管理员权限</p>
                  <p>可以管理算法和模型配置</p>
                </div>
              </div>
              <Button 
                onClick={handleSignUp} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    注册中...
                  </>
                ) : (
                  '注册'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
