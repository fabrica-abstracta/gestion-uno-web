import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../core/config/axios";
import Modal from "../atoms/modal";
import Input from "../atoms/input";
import Textarea from "../atoms/textarea";
import { buttonStyles, flexColGap2, flexJustifyEndGap3, formTextStyles, inputStyles, modalStyle } from "../../core/helpers/styles";
import { notifySuccess, notifyError } from "../../core/helpers/shared";
import { useState } from "react";

// Schema de validación
const reportIncidentSchema = z.object({
  code: z.string().min(1, "El código es requerido"),
  message: z.string().min(1, "El mensaje es requerido"),
  endpoint: z.string().min(1, "El endpoint es requerido"),
  method: z.string().min(1, "El método es requerido"),
  userComments: z.string().min(10, "Por favor, describe el problema con más detalle (mínimo 10 caracteres)"),
});

type ReportIncidentInput = z.infer<typeof reportIncidentSchema>;

interface ReportIncidentModalProps {
  open: boolean;
  onClose: () => void;
  errorData: {
    code: string;
    message: string;
    endpoint: string;
    method: string;
    details?: Record<string, any>;
  };
}

export default function ReportIncidentModal({ open, onClose, errorData }: ReportIncidentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ReportIncidentInput>({
    resolver: zodResolver(reportIncidentSchema),
    defaultValues: {
      code: errorData.code,
      message: errorData.message,
      endpoint: errorData.endpoint,
      method: errorData.method,
      userComments: "",
    },
    mode: "onChange"
  });

  const onSubmit = async (data: ReportIncidentInput) => {
    setIsSubmitting(true);
    try {
      await api.post("/api-detail", {
        ...data,
        details: errorData.details || {},
        timestamp: new Date().toISOString(),
      });
      
      notifySuccess({ code: "SUCCESS", message: "Incidente reportado correctamente. Nuestro equipo lo revisará pronto." });
      reset();
      onClose();
    } catch (err) {
      notifyError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <form onSubmit={handleSubmit(onSubmit)} className={`mx-auto max-w-[720px] ${modalStyle}`}>
        <div>
          <h2 className="text-xl font-semibold">Reportar Incidente</h2>
          <p className="text-sm text-gray-500">
            Ayúdanos a resolver este problema proporcionando más información.
          </p>
        </div>

        <div className={flexColGap2}>
          <Input
            label="Código de Error"
            containerClassName={flexColGap2}
            labelClassName={formTextStyles.label}
            inputClassName={`${inputStyles.base} bg-gray-50 cursor-not-allowed`}
            {...register("code")}
            readOnly
          />

          <Textarea
            label="Mensaje de Error"
            containerClassName={flexColGap2}
            labelClassName={formTextStyles.label}
            textareaClassName={`${inputStyles.base} bg-gray-50 cursor-not-allowed resize-none`}
            {...register("message")}
            readOnly
            rows={2}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Endpoint"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={`${inputStyles.base} bg-gray-50 cursor-not-allowed`}
              {...register("endpoint")}
              readOnly
            />

            <Input
              label="Método HTTP"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={`${inputStyles.base} bg-gray-50 cursor-not-allowed`}
              {...register("method")}
              readOnly
            />
          </div>

          <Textarea
            label="Describe el problema"
            placeholder="Por favor, describe qué estabas haciendo cuando ocurrió el error y cualquier información adicional que pueda ayudarnos a resolverlo..."
            containerClassName={flexColGap2}
            labelClassName={formTextStyles.label}
            textareaClassName={`${inputStyles.base} ${errors.userComments ? "border-red-500" : ""}`}
            helperClassName={formTextStyles.helper}
            helperText={errors.userComments?.message}
            {...register("userComments")}
            rows={6}
          />

          {errorData.details && Object.keys(errorData.details).length > 0 && (
            <div>
              <label className={formTextStyles.label}>
                Detalles Técnicos
              </label>
              <pre className="bg-gray-50 p-3 rounded-md text-xs text-gray-700 overflow-x-auto border border-gray-200 mt-1">
                {JSON.stringify(errorData.details, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className={flexJustifyEndGap3}>
          <button
            type="button"
            onClick={handleClose}
            className={buttonStyles.white}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={buttonStyles.blue}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Reporte"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
