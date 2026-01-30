import { Link } from "react-router-dom";
import { useIdentity } from "../../core/contexts/identity";

export default function Home() {
  const { isAuth } = useIdentity();

  return isAuth ? <Welcome /> : <CTA />;
}

function CTA() {
  return (
    <main>
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-2 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  Lanzamiento v1.0.0
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Inventario + POS
                </span>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                Gestión Uno para administrar tu empresa con orden, control y
                ventas rápidas.
              </h1>

              <p className="text-lg leading-relaxed text-gray-600 max-w-2xl">
                Controla tu inventario y registra ventas desde un POS sencillo.
                Todo en un solo lugar, pensado para operar día a día sin
                complicaciones.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button className="inline-flex items-center justify-center rounded-xl px-7 py-4 text-base font-bold text-black shadow-sm hover:opacity-95">
                  Crear cuenta
                </button>
                <button className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-7 py-4 text-base font-bold text-white shadow-sm hover:opacity-95">
                  Ver precios
                </button>
              </div>

              <div className="grid gap-3 pt-3 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 px-4 py-3">
                  <p className="text-sm font-semibold">Inventario claro</p>
                  <p className="text-xs text-gray-600">
                    Stock actualizado y controlable.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 px-4 py-3">
                  <p className="text-sm font-semibold">Ventas POS</p>
                  <p className="text-xs text-gray-600">
                    Registro rápido en el mostrador.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 px-4 py-3">
                  <p className="text-sm font-semibold">Operación diaria</p>
                  <p className="text-xs text-gray-600">
                    Hecho para negocios reales.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Inicio rápido</p>
                    <span className="rounded-full bg-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-700">
                      v1.0.0
                    </span>
                  </div>
                  <div className="grid gap-3">
                    <div className="rounded-xl bg-white border border-gray-200 p-4">
                      <p className="text-sm font-semibold">1) Registra productos</p>
                      <p className="text-xs text-gray-600">
                        Crea tu catálogo y define tu stock.
                      </p>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 p-4">
                      <p className="text-sm font-semibold">2) Vende en el POS</p>
                      <p className="text-xs text-gray-600">
                        Cobra rápido y guarda el historial.
                      </p>
                    </div>
                    <div className="rounded-xl bg-white border border-gray-200 p-4">
                      <p className="text-sm font-semibold">3) Controla inventario</p>
                      <p className="text-xs text-gray-600">
                        Stock actualizado con cada venta.
                      </p>
                    </div>
                  </div>
                  <button className="w-full rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:opacity-95">
                    Empezar en minutos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-2 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-3xl font-extrabold leading-tight">
              Lo esencial para operar hoy
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Gestión Uno v1.0.0 incluye lo necesario para controlar inventario
              y vender desde un POS sin procesos largos.
            </p>
          </div>

          <div className="lg:col-span-8 grid gap-6 sm:grid-cols-2">
            <article className="rounded-2xl border border-gray-200 p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold">Inventario</h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Disponible
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Mantén control de productos y stock con entradas, salidas y
                alertas para evitar faltantes.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-gray-700">
                <li>• Catálogo de productos</li>
                <li>• Entradas y salidas</li>
                <li>• Stock automático</li>
                <li>• Alertas de bajo inventario</li>
              </ul>
              <button className="mt-7 w-full rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:opacity-95">
                Configurar inventario
              </button>
            </article>

            <article className="rounded-2xl border border-gray-200 p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold">Ventas POS</h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Disponible
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Registra ventas rápido en mostrador, guarda historial y actualiza
                el inventario con cada operación.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-gray-700">
                <li>• Registro rápido de ventas</li>
                <li>• Totales automáticos</li>
                <li>• Historial de ventas</li>
                <li>• Manejo de múltiples productos</li>
              </ul>
              <button className="mt-7 w-full rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:opacity-95">
                Empezar a vender
              </button>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-2 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-3xl font-extrabold leading-tight">
                Flujo simple, sin pasos extra
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Un recorrido corto para operar: configurar inventario, vender y
                controlar el stock sin perder tiempo.
              </p>
            </div>

            <div className="lg:col-span-7 grid gap-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white font-extrabold">
                    1
                  </span>
                  <div>
                    <p className="font-bold">Carga tu inventario</p>
                    <p className="text-sm text-gray-600">
                      Registra productos y define tu stock inicial.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white font-extrabold">
                    2
                  </span>
                  <div>
                    <p className="font-bold">Vende desde el POS</p>
                    <p className="text-sm text-gray-600">
                      Registra ventas y guarda el historial automáticamente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white font-extrabold">
                    3
                  </span>
                  <div>
                    <p className="font-bold">Controla tu stock</p>
                    <p className="text-sm text-gray-600">
                      El inventario se actualiza con cada venta y movimiento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <button className="rounded-xl bg-brand-primary px-6 py-4 text-sm font-bold text-white hover:opacity-95">
                  Crear cuenta
                </button>
                <button className="rounded-xl bg-gray-900 px-6 py-4 text-sm font-bold text-white hover:opacity-95">
                  Hablar con ventas
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-2 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-3xl font-extrabold leading-tight">
              Pensado para negocios reales
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Diseñado para mantener operación y control sin interfaces
              complicadas.
            </p>
          </div>

          <div className="lg:col-span-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 p-8">
              <p className="text-sm font-semibold text-gray-500">Inventario</p>
              <p className="mt-2 text-lg font-bold">Menos faltantes</p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Alertas de bajo inventario para actuar antes de quedarte sin
                stock.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-8">
              <p className="text-sm font-semibold text-gray-500">POS</p>
              <p className="mt-2 text-lg font-bold">Ventas más rápidas</p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Registro de ventas directo para atender sin retrasos.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-8">
              <p className="text-sm font-semibold text-gray-500">Control</p>
              <p className="mt-2 text-lg font-bold">Orden diario</p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Inventario y ventas en el mismo lugar para operar con claridad.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-8">
              <p className="text-sm font-semibold text-gray-500">Arranque</p>
              <p className="mt-2 text-lg font-bold">Implementación simple</p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Enfocado en lo esencial de v1.0.0 para comenzar sin fricción.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


function Welcome() {
  return (
    <div className="space-y-4 w-full max-w-5xl mx-auto p-4 md:p-8 flex gap-4 flex-col">
      <div className="text-center mb-12 sm:mb-16 mt-12 sm:mt-16">
        <div className="text-6xl sm:text-7xl mb-4 animate-bounce">🚀</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          ¡Bienvenido a tu espacio de trabajo!
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Explora las herramientas y extensiones para llevar tus APIs al
          siguiente nivel
        </p>
      </div>

      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            🔥 Funcionabilidades
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: "ai-contract",
              icon: "🤖",
              title: "Control de acceso",
              description: "Genera contratos OpenAPI automáticamente usando inteligencia artificial.",
              action: "Ver más",
              route: "/users",
            },
            {
              id: "github-sync",
              icon: "🔄",
              title: "Sincronización con GitHub",
              description: "Sincroniza tus OpenAPIs directamente con repositorios de GitHub.",
              action: "Configurar",
              route: "/settings",
            }
          ].map((addon) => (
            <div
              key={addon.id}
              className="rounded-lg shadow border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
            >
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex gap-4">
                  <div className="text-4xl">{addon.icon}</div>
                  {addon.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {addon.description}
                </p>
              </div>
              <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white">
                {addon.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            📖 Recursos Rápidos
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "📚",
              title: "Documentación",
              description: "Aprende a usar todas las funcionalidades de la plataforma",
              link: "/docs",
            },
            {
              icon: "⚙️",
              title: "Configuración",
              description: "Personaliza tu perfil y preferencias",
              link: "/settings",
            },
          ].map((resource, idx) => (
            <Link
              key={idx}
              to={resource.link}
              className="rounded-lg shadow border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200 group"
            >
              <div className="mb-3 font-semibold text-sm">
                {resource.icon}
                {resource.title}
              </div>

              <p className="text-sm text-gray-600">{resource.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

