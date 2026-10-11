import type { InjectionKey, Ref } from 'vue'

export interface CollapseContext {
  activeKeys: Ref<string[]>
  toggle: (key: string, open: boolean) => void
}

export const collapseKey: InjectionKey<CollapseContext> = Symbol('ui-collapse')
