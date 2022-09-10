import { ReactNode } from 'react';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';

type FormProps = {
  form: UseFormReturn<any>;
  onSubmit: (values: FieldValues) => void;
  children: ReactNode;
  className?: string;
};

const Form = ({ form, onSubmit, children, className }: FormProps) => {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
};

export default Form;
