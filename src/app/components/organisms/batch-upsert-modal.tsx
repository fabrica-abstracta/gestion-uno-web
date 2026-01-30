import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../atoms/modal";
import Input from "../atoms/input";
import Select from "../atoms/select";
import type { LoadState } from "../atoms/modal";
import {
  flexColGap2,
  flexJustifyEndGap3,
  formTextStyles,
  inputStyles,
  modalStyle,
  spinnerStyle,
  buttonBlueLabel,
  buttonStyles,
} from "../../core/helpers/styles";
import { loadingButton } from "../../core/helpers/shared";
import Textarea from "../atoms/textarea";

const batchUpsertSchema = z.object({
  productId: z.string().min(1),
  lotCode: z.string().min(1, "Código de lote es requerido"),
  expiresAt: z.string().optional(),
  stock: z.number().min(0, "Stock debe ser mayor o igual a 0"),
  type: z.enum(["increment", "decrement"]),
  reason: z.string().min(1, "Motivo es requerido"),
});

type BatchUpsertInput = z.infer<typeof batchUpsertSchema>;

interface BatchUpsertModalProps {
  open: boolean;
  loadState: LoadState;
  loadAPI: LoadState;
  productId?: string;
  onClose: () => void;
  onSubmit: (data: BatchUpsertInput) => void;
}

export default function BatchUpsertModal({
  open,
  loadState,
  loadAPI,
  productId = "",
  onClose,
  onSubmit,
}: BatchUpsertModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isValid, isSubmitting },
  } = useForm<BatchUpsertInput>({
    resolver: zodResolver(batchUpsertSchema),
    defaultValues: {
      productId,
      lotCode: "",
      expiresAt: "",
      stock: 0,
      type: "increment",
      reason: "",
    },
    mode: "onChange",
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} load={loadState} onClose={handleClose}>
      <form
        onSubmit={handleSubmit((data) => {
          onSubmit(data);
          reset();
        })}
        className={`mx-auto max-w-[520px] ${modalStyle}`}
      >
        <div>
          <h2 className="text-xl font-semibold">Gestionar Lote</h2>
          <p className="text-sm text-gray-500">
            Incrementa o decrementa el stock de un lote.
          </p>
        </div>

        <div className={flexColGap2}>
          <Input
            label="Código de lote *"
            placeholder="p. ej. LOTE-2026-001"
            containerClassName={flexColGap2}
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...register("lotCode")}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                label="Tipo de movimiento *"
                options={[
                  { label: "Incremento", value: "increment" },
                  { label: "Decremento", value: "decrement" },
                ]}
                value={field.value}
                onChange={field.onChange}
                placeholder="Seleccionar tipo"
                containerClassName={flexColGap2}
                labelClassName={formTextStyles.label}
                inputClassName={inputStyles.base}
              />
            )}
          />

          <Input
            label="Fecha de vencimiento (opcional)"
            type="date"
            containerClassName={flexColGap2}
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...register("expiresAt")}
          />

          <Input
            label="Cantidad *"
            type="number"
            containerClassName={flexColGap2}
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...register("stock", { valueAsNumber: true })}
          />

          <Textarea
            label="Motivo *"
            placeholder="p. ej. Entrada de mercancía, Ajuste de inventario"
            containerClassName={flexColGap2}
            labelClassName={formTextStyles.label}
            textareaClassName={inputStyles.base}
            {...register("reason")}
          />
        </div>

        <div className={flexJustifyEndGap3}>
          <button
            type="button"
            className={buttonStyles.white}
            onClick={handleClose}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!isValid || isSubmitting || loadAPI === "loading"}
            className={`${buttonStyles.blue} flex items-center justify-center gap-2 ${!isValid || loadAPI === "loading" ? "opacity-50 cursor-not-allowed" : ""
              }`}
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
