'use client'

import { Badge } from '@/components/ui/badge'

export function ConsultationCoverageHelpDialogContent() {
  return (
    <section className="rounded-md border border-border/70 p-3">
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">
        <p>
          В этом разделе указано количество и доля консультаций по продукту на основе типа
          обращения*, закрепленного в сетке классификации в Сервисе инсайтов.
        </p>

        <h4 className="text-base font-semibold text-foreground">Типы обращения:</h4>

        <div className="space-y-2">
          <div className="rounded-md border border-red-300/70 bg-red-50/40 p-2.5">
            <Badge variant="outline" className="border-red-300/80 text-red-700">
              Претензия
            </Badge>
            <p className="mt-2">
              Обращение с недовольством (жалоба на ошибки, сроки или угроза ухода). В данном
              дашборде выявляется с помощью ИИ.
            </p>
          </div>

          <div className="rounded-md border border-amber-300/70 bg-amber-50/40 p-2.5">
            <Badge variant="outline" className="border-amber-300/80 text-amber-700">
              Консультация
            </Badge>
            <p className="mt-2">
              Запрос информации или помощи (условия, порядок действий). Определяется автоматически
              по тематике обращения, закрепленного в сетке классификации.
            </p>
          </div>
        </div>

        <p>
          * Логика описания типов обращений доступна в Сервисе инсайтов:{' '}
          <a
            href="https://genai-insight-service.paas-dataplatform-prod.berekebank.kz/configurator"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-primary underline underline-offset-2"
          >
            <i>Сервис инсайтов → Сетка классификации → Category RB</i>
          </a>
        </p>
      </div>
    </section>
  )
}
