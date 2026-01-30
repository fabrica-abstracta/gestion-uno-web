import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Textarea from "../../../atoms/textarea";
import { SalesPOS, type CartItem, type ProductRow } from "../sales/pos";
import {
	buttonStyles,
	containerStyle,
	flexColGap2,
	formTextStyles,
	inputStyles,
} from "../../../../core/helpers/styles";
import type { Order } from "../../../../core/types/orders";
import {
	orderCreateSchema,
	orderCreateDefaultValues,
	type OrderCreateInput,
} from "../../../../core/validations/orders";

type OrderStatus = "draft" | "pending" | "processing" | "completed" | "cancelled";

const getStatusColor = (status: OrderStatus) => {
	switch (status) {
		case "draft":
			return "bg-gray-100 text-gray-800";
		case "pending":
			return "bg-yellow-100 text-yellow-800";
		case "processing":
			return "bg-blue-100 text-blue-800";
		case "completed":
			return "bg-green-100 text-green-800";
		case "cancelled":
			return "bg-red-100 text-red-800";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

export default function Order() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const isNewOrder = id === "new";

	const [order, setOrder] = useState<Order | null>(null);
	const [loadAPI, setLoadAPI] = useState<"idle" | "loading" | "ok" | "error">("idle");
	const [localCart, setLocalCart] = useState<CartItem[]>([]);

	const orderForm = useForm<OrderCreateInput>({
		resolver: zodResolver(orderCreateSchema),
		defaultValues: orderCreateDefaultValues,
	});

	const fetchOrder = async () => {
		if (isNewOrder || !id) return;
		try {
			setLoadAPI("loading");
			const response = await api.get(`/orders/${id}`);
			setOrder(response.data.data);
			orderForm.reset({
				notes: response.data.data.notes || "",
			});
			setLoadAPI("ok");
		} catch (error) {
			setLoadAPI("error");
		}
	};

	useEffect(() => {
		fetchOrder();
	}, [id]);

	const cartItems = useMemo(() => {
		if (isNewOrder) return localCart;
		return (order?.items || []).map((item) => ({
			productId: item.product,
			name: item.productName || "",
			price: item.unitPrice,
			quantity: item.quantity,
			subtotal: item.subtotal,
			itemId: item._id,
			status: item.status,
		})) as CartItem[];
	}, [isNewOrder, localCart, order?.items]);

	const totalAmount = useMemo(() => {
		return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
	}, [cartItems]);

	const saveOrder = async (data: OrderCreateInput) => {
		try {
			setLoadAPI("loading");
			if (isNewOrder) {
				const payload = {
					...data,
					items: localCart.map((item) => ({
						product: item.productId,
						quantity: item.quantity,
						unitPrice: item.price,
					})),
				};
				const response = await api.post("/orders", payload);
				setLoadAPI("ok");
				setLocalCart([]);
				navigate(`/orders/${response.data.data._id}`, { replace: true });
			} else if (id) {
				await api.put(`/orders/${id}`, data);
				setLoadAPI("ok");
				await fetchOrder();
			}
		} catch (error) {
			setLoadAPI("error");
		}
	};

	const handleAddProduct = async (product: ProductRow) => {
		if (isNewOrder) return;
		if (!id) return;

		try {
			setLoadAPI("loading");
			await api.post(`/orders/${id}/items`, {
				product: product.id,
				quantity: 1,
				unitPrice: Number(product.price?.replace(/[^\d.-]/g, "")) || 0,
			});
			await fetchOrder();
			setLoadAPI("ok");
		} catch (error) {
			setLoadAPI("error");
		}
	};

	const handleQuantityChange = async (productId: string, quantity: number) => {
		if (isNewOrder || !id || !order?.items) return;
		const item = order.items.find((i) => i.product === productId);
		if (!item?._id) return;

		try {
			setLoadAPI("loading");
			if (quantity === 0) {
				await api.delete(`/orders/${id}/items/${item._id}`);
			} else {
				await api.put(`/orders/${id}/items/${item._id}`, { quantity });
			}
			await fetchOrder();
			setLoadAPI("ok");
		} catch (error) {
			setLoadAPI("error");
		}
	};

	const handleRemoveItem = async (productId: string) => {
		if (isNewOrder || !id || !order?.items) return;
		const item = order.items.find((i) => i.product === productId);
		if (!item?._id) return;

		try {
			setLoadAPI("loading");
			await api.delete(`/orders/${id}/items/${item._id}`);
			await fetchOrder();
			setLoadAPI("ok");
		} catch (error) {
			setLoadAPI("error");
		}
	};

	return (
		<div className={containerStyle}>
			<div className="space-y-6">
				<div className="flex justify-between items-start">
					<div className="space-y-2">
						<h1 className="text-2xl font-bold">Venta Directa (POS)</h1>
						<div className="text-sm text-gray-600">#{order?.code || "ORDER-NUEVA"}</div>
						<div className="flex items-center gap-3">
							<span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor((order?.status || "draft") as OrderStatus)}`}>
								{order?.status === "pending" && "Pendiente"}
								{order?.status === "processing" && "En Proceso"}
								{order?.status === "completed" && "Completada"}
								{order?.status === "cancelled" && "Cancelada"}
								{!order?.status || order?.status === "draft" ? "Borrador" : null}
							</span>
							<span className="text-sm text-gray-600">Total: $ {totalAmount.toFixed(2)}</span>
						</div>
					</div>

					<button onClick={() => navigate("/orders")} className={buttonStyles.white}>
						Volver
					</button>
				</div>

				<SalesPOS
					mode="order"
					cart={cartItems}
					onCartChange={isNewOrder ? setLocalCart : undefined}
					onAddProduct={isNewOrder ? undefined : handleAddProduct}
					onQuantityChange={isNewOrder ? undefined : handleQuantityChange}
					onRemoveItem={isNewOrder ? undefined : handleRemoveItem}
				/>

				<div className="flex flex-col gap-4">
					<div className="bg-white rounded-2xl border border-gray-200 p-4">
						<Textarea
							label="Notas"
							placeholder="Notas internas de la orden"
							containerClassName="w-full"
							labelClassName={formTextStyles.label}
							textareaClassName={inputStyles.base}
							disabled={loadAPI === "loading"}
							rows={3}
							{...orderForm.register("notes")}
						/>
					</div>

					<div className={flexColGap2}>
						<button
							type="button"
							disabled={loadAPI === "loading"}
							onClick={() => orderForm.handleSubmit(saveOrder)()}
							className={buttonStyles.green}
						>
							{loadAPI === "loading" ? "Guardando..." : "Guardar orden"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
