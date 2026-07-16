import type { NextFunction, Request, Response } from 'express'
import { supabaseAdmin } from '../lib/supabase'

/**
 * Protege rotas administrativas: exige um JWT Supabase válido no header
 * Authorization e confirma que o usuário está cadastrado em public.admins.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    res.status(401).json({ error: 'Token de autenticação ausente' })
    return
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)

  if (userError || !userData.user) {
    res.status(401).json({ error: 'Token inválido ou expirado' })
    return
  }

  const { data: admin } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (!admin) {
    res.status(403).json({ error: 'Acesso restrito a administradores' })
    return
  }

  next()
}
