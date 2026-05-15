'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useStore } from '@/lib/store/use-store'
interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const isAuthOpen = open
  const setIsAuthOpen = onOpenChange
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('登录成功！')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast.success('注册成功！请检查你的邮箱验证链接。')
      }
      setIsAuthOpen(false)
    } catch (error: any) {
      toast.error(error.message || '发生错误，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isLogin ? '登录账号' : '注册账号'}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? '登录以保存和管理你的项目。'
              : '创建一个新账号来体验所有功能。'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAuth} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '请稍候...' : isLogin ? '登 录' : '注 册'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            {isLogin ? '没有账号？点击注册' : '已有账号？返回登录'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
