import { Link } from "react-router-dom";
import { useIdentity } from "../../core/contexts/identity";
import { useModal } from "../../core/contexts/modal";

export default function Home() {
  const { isAuth } = useIdentity();

  return isAuth ? <Welcome /> : <CTA />;
}

function CTA() {
  const { openModal } = useModal();

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Plataforma completa de gestión empresarial
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 max-w-5xl mx-auto">
              Administra tu negocio
              <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                en un solo lugar
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Control total de inventario, ventas, reservas, órdenes y catálogos.
              Gestiona tu empresa con colaboradores en tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => openModal("signUp")}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">Comenzar gratis</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
              <Link
                to="/plans"
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              >
                Ver planes
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
              {[
                { label: 'Inventario ilimitado', icon: '📦' },
                { label: 'Ventas en tiempo real', icon: '💰' },
                { label: 'Tracking completo', icon: '📊' },
                { label: 'Catálogos privados', icon: '🔐' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-700 font-medium">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Todo lo que necesitas para gestionar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas profesionales diseñadas para empresas que buscan eficiencia y control total
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '📦',
                title: 'Gestión de Inventario',
                description: 'Control completo de productos, stock, categorías, marcas y proveedores. Alertas automáticas de bajo inventario.',
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                icon: '💳',
                title: 'Punto de Venta (POS)',
                description: 'Sistema POS profesional para ventas rápidas. Múltiples métodos de pago, historial completo y sincronización automática.',
                gradient: 'from-green-500 to-green-600'
              },
              {
                icon: '📅',
                title: 'Reservaciones',
                description: 'Administra reservas con check-in/out, múltiples productos, gestión de fechas y estados personalizados.',
                gradient: 'from-purple-500 to-purple-600'
              },
              {
                icon: '📋',
                title: 'Órdenes y Pedidos',
                description: 'Tracking completo de órdenes de compra y venta. Seguimiento de estados, fechas de entrega y notificaciones.',
                gradient: 'from-indigo-500 to-indigo-600'
              },
              {
                icon: '📖',
                title: 'Catálogos Premium',
                description: 'Crea catálogos personalizados con precios por segmento, vigencia, acceso privado o público con contraseña.',
                gradient: 'from-orange-500 to-orange-600'
              },
              {
                icon: '👥',
                title: 'Gestión de Clientes',
                description: 'CRM completo con segmentación avanzada, historial de compras y análisis de comportamiento de clientes.',
                gradient: 'from-pink-500 to-pink-600'
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl border-2 border-gray-100 p-8 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <div className={`absolute -top-5 left-8 w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                  {feature.icon}
                </div>
                <div className="pt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
                <span>🚀</span>
                Colaboración en equipo
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
                Trabaja con tu equipo en tiempo real
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Invita colaboradores, asigna roles y permisos específicos. Todos trabajan sobre la misma información actualizada al instante.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  'Roles personalizados para cada miembro',
                  'Permisos granulares por módulo',
                  'Historial de cambios y auditoría',
                  'Notificaciones en tiempo real'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      ✓
                    </div>
                    <p className="text-gray-700 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '👤', label: 'Admin', color: 'bg-blue-500' },
                { icon: '📊', label: 'Gerente', color: 'bg-purple-500' },
                { icon: '💼', label: 'Vendedor', color: 'bg-green-500' },
                { icon: '📦', label: 'Almacén', color: 'bg-orange-500' }
              ].map((role, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center hover:scale-105 transition-transform">
                  <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center text-3xl mx-auto mb-3`}>
                    {role.icon}
                  </div>
                  <p className="font-bold text-gray-900">{role.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700 mb-4">
              ⭐ Funciones premium
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Catálogos inteligentes para tus clientes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Crea experiencias personalizadas con catálogos públicos o privados, precios por segmento y acceso controlado
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🌐',
                title: 'Catálogos Públicos',
                description: 'Comparte tus productos con cualquier cliente. URLs personalizadas y totalmente accesibles.',
                features: ['URL personalizada', 'Sin restricciones', 'SEO optimizado']
              },
              {
                icon: '🔐',
                title: 'Catálogos Privados',
                description: 'Acceso exclusivo con contraseña. Ideal para clientes VIP o promociones especiales.',
                features: ['Protección por contraseña', 'Acceso limitado', 'Clientes exclusivos']
              },
              {
                icon: '💎',
                title: 'Precios por Segmento',
                description: 'Define precios diferentes según el tipo de cliente. Segmentación automática y descuentos.',
                features: ['Precios dinámicos', 'Segmentación avanzada', 'Descuentos automáticos']
              }
            ].map((catalog, i) => (
              <div key={i} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
                <div className="text-5xl mb-4">{catalog.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{catalog.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{catalog.description}</p>
                <ul className="space-y-2">
                  {catalog.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">●</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-4xl lg:text-5xl font-extrabold">
              Comienza a gestionar tu negocio hoy
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Únete a cientos de empresas que ya confían en Gestión Uno para administrar sus operaciones
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => openModal("signUp")}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Crear cuenta gratis
              </button>
              <Link
                to="/plans"
                className="px-8 py-4 bg-transparent text-white rounded-xl font-bold text-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Ver planes y precios
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto border-t border-blue-500/30 mt-12">
              <div>
                <p className="text-4xl font-extrabold mb-2">+1000</p>
                <p className="text-blue-200">Empresas activas</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold mb-2">99.9%</p>
                <p className="text-blue-200">Uptime garantizado</p>
              </div>
              <div>
                <p className="text-4xl font-extrabold mb-2">24/7</p>
                <p className="text-blue-200">Soporte disponible</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


function Welcome() {
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-8">
      <div className="text-center mb-12 sm:mb-16 mt-8 sm:mt-12">
        <div className="text-6xl sm:text-7xl mb-4">🏢</div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          ¡Bienvenido a Gestión Uno!
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          Tu sistema completo para gestionar inventario, ventas, reservaciones, clientes y catálogos.
          Todo centralizado y optimizado para el éxito de tu negocio.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-2xl font-bold mb-1">Inventario</div>
          <p className="text-sm opacity-90">Control total de stock</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold mb-1">Ventas</div>
          <p className="text-sm opacity-90">POS y transacciones</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold mb-1">Reservaciones</div>
          <p className="text-sm opacity-90">Gestión de reservas</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold mb-1">Clientes</div>
          <p className="text-sm opacity-90">CRM y segmentación</p>
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            🚀 Módulos Principales
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: "inventory",
              icon: "📦",
              title: "Inventario",
              description: "Gestiona productos, categorías, marcas, unidades, proveedores y lotes con control de stock en tiempo real.",
              action: "Gestionar Inventario",
              route: "/inventory",
              color: "blue"
            },
            {
              id: "pos",
              icon: "💳",
              title: "Punto de Venta",
              description: "Sistema POS completo para ventas rápidas en mostrador con cálculo automático y múltiples métodos de pago.",
              action: "Abrir POS",
              route: "/pos",
              color: "green"
            },
            {
              id: "orders",
              icon: "🛒",
              title: "Órdenes",
              description: "Administra órdenes de compra y venta, seguimiento de estado y gestión completa del ciclo de vida.",
              action: "Ver Órdenes",
              route: "/orders",
              color: "indigo"
            },
            {
              id: "reservations",
              icon: "📅",
              title: "Reservaciones",
              description: "Sistema de reservas con múltiples productos, check-in/out, gestión de fechas y estados de reserva.",
              action: "Ver Reservaciones",
              route: "/reservations",
              color: "purple"
            },
            {
              id: "customers",
              icon: "👥",
              title: "Clientes",
              description: "CRM completo con datos de contacto, historial de compras y segmentación avanzada de clientes.",
              action: "Gestionar Clientes",
              route: "/customers",
              color: "pink"
            },
            {
              id: "catalogs",
              icon: "📖",
              title: "Catálogos",
              description: "Crea catálogos personalizados con precios por segmento, vigencia, contraseña y vista previa.",
              action: "Ver Catálogos",
              route: "/catalogs",
              color: "orange"
            },
            {
              id: "movements",
              icon: "📊",
              title: "Movimientos",
              description: "Registra entradas, salidas, pérdidas y ajustes de inventario con trazabilidad completa.",
              action: "Ver Movimientos",
              route: "/movements",
              color: "cyan"
            },
            {
              id: "payment-intents",
              icon: "💵",
              title: "Intenciones de Pago",
              description: "Gestiona aprobaciones de pago, métodos diversos (YAPE, PLIN, tarjeta) y estados de transacción.",
              action: "Ver Pagos",
              route: "/payment-intents",
              color: "teal"
            },
            {
              id: "history",
              icon: "📜",
              title: "Historial",
              description: "Consulta transacciones de ventas y compras con filtros avanzados, rangos de fecha y resúmenes.",
              action: "Ver Historial",
              route: "/history",
              color: "amber"
            }
          ].map((feature) => (
            <Link
              key={feature.id}
              to={feature.route}
              className={`rounded-xl shadow-lg border-2 border-${feature.color}-200 bg-white p-6 hover:shadow-xl hover:border-${feature.color}-400 transition-all duration-200 group`}
            >
              <div className="flex-1 flex flex-col h-full">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-5xl">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-6 flex-grow">
                  {feature.description}
                </p>
                <div className={`w-full rounded-lg bg-${feature.color}-600 px-4 py-3 text-white text-center font-semibold group-hover:bg-${feature.color}-700 transition-colors`}>
                  {feature.action}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            🎯 Funcionalidades Avanzadas
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "🎨",
              title: "Segmentación de Clientes",
              description: "Crea segmentos con condiciones múltiples por edad, compras, fechas y más.",
              highlight: "Personalización"
            },
            {
              icon: "💲",
              title: "Precios por Segmento",
              description: "Define precios diferentes según el segmento de cliente en tus catálogos.",
              highlight: "Estrategia"
            },
            {
              icon: "📤",
              title: "Importación CSV",
              description: "Carga productos masivamente desde archivos CSV para catálogos.",
              highlight: "Productividad"
            },
            {
              icon: "🔐",
              title: "Catálogos Protegidos",
              description: "Asigna contraseñas y fechas de vigencia a tus catálogos.",
              highlight: "Seguridad"
            },
            {
              icon: "📈",
              title: "Reportes y Analytics",
              description: "Consulta resúmenes, totales y estadísticas de tu operación.",
              highlight: "Insights"
            },
            {
              icon: "🔔",
              title: "Alertas de Stock",
              description: "Recibe notificaciones cuando los productos alcancen stock mínimo.",
              highlight: "Prevención"
            }
          ].map((feature, idx) => (
            <div
              key={idx}
              className="rounded-xl shadow border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{feature.icon}</div>
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {feature.highlight}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            ⚡ Acciones Rápidas
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: "➕",
              title: "Nuevo Producto",
              description: "Agregar al inventario",
              link: "/inventory",
              bg: "bg-blue-50 border-blue-200 hover:bg-blue-100"
            },
            {
              icon: "🛍️",
              title: "Nueva Venta",
              description: "Abrir punto de venta",
              link: "/pos",
              bg: "bg-green-50 border-green-200 hover:bg-green-100"
            },
            {
              icon: "📝",
              title: "Nueva Reserva",
              description: "Crear reservación",
              link: "/reservations",
              bg: "bg-purple-50 border-purple-200 hover:bg-purple-100"
            },
            {
              icon: "👤",
              title: "Nuevo Cliente",
              description: "Registrar cliente",
              link: "/customers",
              bg: "bg-pink-50 border-pink-200 hover:bg-pink-100"
            }
          ].map((action, idx) => (
            <Link
              key={idx}
              to={action.link}
              className={`rounded-lg border-2 ${action.bg} p-5 transition-all duration-200 group`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h4 className="font-bold text-gray-900 mb-1">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">¿Necesitas ayuda?</h2>
        <p className="text-lg mb-6 opacity-90">
          Explora la documentación o contacta a soporte para comenzar
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Ver Documentación
          </button>
          <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Contactar Soporte
          </button>
        </div>
      </div>
    </div>
  );
}

