import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../atoms/modal";
import Input from "../atoms/input";
import Select from "../atoms/select";
import Textarea from "../atoms/textarea";
import type { LoadState } from "../atoms/modal";
import {
  flexColGap2,
  flexJustifyEndGap3,
  modalStyle,
  spinnerStyle,
  buttonBlueLabel,
  buttonStyles,
} from "../../core/helpers/styles";
import { loadingButton } from "../../core/helpers/shared";
import { batchUpsertSchema, type BatchUpsertInput } from "../../core/validations/batches";

interface BatchUpsertModalProps {
  open: boolean;
  loadState: LoadState;
  loadAPI: LoadState;
  productId: string;
  batchId?: string;
  initialAction?: "increment" | "decrement";
  onClose: () => void;
  onSubmit: (data: BatchUpsertInput) => void;
  onRetry: () => void;
}

export default function BatchUpsertModal({
  open,
  loadState,
  loadAPI,
  productId,
  batchId,
  initialAction = "increment",
  onClose,
  onSubmit,
  onRetry,
}: BatchUpsertModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<BatchUpsertInput>({
    resolver: zodResolver(batchUpsertSchema),
    mode: "onChange",
    defaultValues: {
      id: "",
      product: productId,
      code: "",
      expiresAt: "",
      quantity: 1,
      action: "increment",
      reason: "",
    },
  });

  const action = watch("action");
  const isCreate = !batchId;

  useEffect(() => {
    if (open) {
      const isCreating = !batchId;
      reset({
        id: batchId || "",
        product: productId,
        code: "",
        expiresAt: "",
        quantity: 1,
        action: isCreating ? "increment" : initialAction,
        reason: "",
      });
    }
  }, [open, productId, batchId, initialAction, reset]);

  const handleClose = () => {
    reset({
      id: "",
      product: productId,
      code: "",
      expiresAt: "",
      quantity: 1,
      action: "increment",
      reason: "",
    });
    onClose();
  };

  const onFormSubmit = (data: BatchUpsertInput) => {
    onSubmit(data);
  };

  return (
    <Modal open={open} load={loadState} onClose={handleClose} onRetry={onRetry}>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className={`mx-auto max-w-[520px] ${modalStyle}`}
      >
        <div>
          <h2 className="text-xl font-semibold">
            {isCreate ? "Crear Lote" : action === "increment" ? "Incrementar Stock" : "Decrementar Stock"}
          </h2>
          <p className="text-sm text-gray-500">
            {isCreate 
              ? "Agrega una nueva entrada de stock para el producto."
              : action === "increment"
                ? "Aumenta el stock del lote existente."
                : "Reduce el stock del lote (marca el lote como usado)."
            }
          </p>
        </div>

        <div className={flexColGap2}>
          <Controller
            name="action"
            control={control}
            render={({ field }) => (
              <Select
                label="Acción *"
                options={[
                  { label: "Incrementar Stock", value: "increment" },
                  { label: "Decrementar Stock", value: "decrement" },
                ]}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {isCreate && (
            <>
              <Input
                label="Código de lote"
                placeholder="Se genera automáticamente"
                error={errors.code?.message}
                {...register("code")}
              />

              <Input
                label="Fecha de vencimiento"
                type="date"
                error={errors.expiresAt?.message}
                {...register("expiresAt")}
              />
            </>
          )}

          <Input
            label="Cantidad *"
            type="number"
            placeholder="1"
            min="1"
            error={errors.quantity?.message}
            {...register("quantity", { valueAsNumber: true })}
          />

          <Textarea
            label={`Motivo ${action === "decrement" ? "*" : ""}`}
            placeholder={action === "decrement" 
              ? "Ej: Venta, Devolución, Ajuste, etc." 
              : "Ej: Compra, Producción, Ajuste, etc."}
            rows={2}
            error={errors.reason?.message}
            {...register("reason")}
          />
        </div>

        <div className={flexJustifyEndGap3}>
          <button
            type="button"
            className={buttonStyles.white}
            onClick={handleClose}
            disabled={loadAPI === "loading"}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!isValid || loadAPI === "loading"}
            className={`${buttonStyles.blue} flex items-center justify-center gap-2 ${!isValid || loadAPI === "loading" ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loadAPI === "loading"
              ? loadingButton("Guardando…", spinnerStyle, buttonBlueLabel)
              : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export type { BatchUpsertInput };
