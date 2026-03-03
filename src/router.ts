// Generouted, changes to this file will be overridden
/* eslint-disable */

import { components, hooks, utils } from '@generouted/react-router/client'

export type Path =
  | `/`
  | `/dashboard`
  | `/dashboard/ads`
  | `/dashboard/ads/:id`
  | `/dashboard/news`
  | `/dashboard/news/:id`
  | `/dashboard/users`
  | `/login`
  | `/register`

export type Params = {
  '/dashboard/ads/:id': { id: string }
  '/dashboard/news/:id': { id: string }
}

export type ModalPath = never

export const { Link, Navigate } = components<Path, Params>()
export const { useModals, useNavigate, useParams } = hooks<Path, Params, ModalPath>()
export const { redirect } = utils<Path, Params>()
