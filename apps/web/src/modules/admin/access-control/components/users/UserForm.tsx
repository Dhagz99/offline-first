"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  UserRound,
  AtSign,
  Mail,
  LockKeyhole,
  ShieldCheck,
  Check,
  Info,
} from "lucide-react";

import {
  createUserSchema,
  updateUserSchema,
  type CreateUserSchema,
  type UpdateUserSchema,
} from "@repo/shared";

import type { UserFormProps } from "../../types/access-control.types";

import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { Input } from "@/components/ui/input";

import { UserBranchSelect } from "./UserBranchSelect";

type FormValues = CreateUserSchema | UpdateUserSchema;

export function UserForm({
  mode,
  user,
  roles,
  isSubmitting = false,
  onCreate,
  onUpdate,
}: UserFormProps) {
  const isEdit = mode === "edit";

  /* =====================
     FORM INITIALIZATION
  ===================== */

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: {
      errors,
      dirtyFields,
    },
  } = useForm<FormValues>({
    resolver: zodResolver(
      isEdit ? updateUserSchema : createUserSchema
    ),

    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      roleIds: [],
      branchIds: [],
      isActive: true,
    },
  });

  /* =====================
     RESET FORM
  ===================== */

  useEffect(() => {
    if (isEdit && user) {
      reset({
        name: user.name,
        username: user.username,
        email: user.email ?? "",
        password: "",

        roleIds: user.roles.map(
          (role) => role.id
        ),

        branchIds:
          user.branches?.map(
            (branch) => branch.id
          ) ?? [],

        isActive: user.isActive,
      });
    } else {
      reset({
        name: "",
        username: "",
        email: "",
        password: "",
        roleIds: [],
        branchIds: [],
        isActive: true,
      });
    }
  }, [isEdit, user, reset]);

  /* =====================
     FORM SUBMISSION
  ===================== */

  const submit = (data: FormValues) => {
    if (isEdit) {
      const {
        branchIds,
        password,
        ...rest
      } = data;

      const payload: UpdateUserSchema = {
        ...rest,

        // Only update password when provided.
        ...(password
          ? { password }
          : {}),

        // Only update branch assignments when changed.
        ...(dirtyFields.branchIds
          ? { branchIds: branchIds ?? [] }
          : {}),
      };

      onUpdate?.(payload);

      return;
    }

    onCreate?.(data as CreateUserSchema);
  };

  /* =====================
     INPUT STYLING
  ===================== */

  const inputClassName = `
    h-11 w-full rounded-lg
    border border-slate-200
    bg-white px-3
    text-sm text-slate-800
    placeholder:text-slate-400
    transition-colors
    focus-visible:border-sky-400
    focus-visible:ring-2
    focus-visible:ring-sky-100
    disabled:cursor-not-allowed
    disabled:bg-slate-50
  `;

  return (
    <form
      id="user-form"
      onSubmit={handleSubmit(submit)}
      className="space-y-6"
    >
      {/* =====================
          FORM INTRODUCTION
      ===================== */}

      <div className="flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/70 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600">
          <UserRound size={20} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#14243B]">
            {isEdit
              ? "Update User Information"
              : "New User Account"}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {isEdit
              ? "Update account details, assigned roles, and branch access."
              : "Configure a new system account, roles, and branch access."}
          </p>
        </div>
      </div>

      {/* =====================
          ACCOUNT INFORMATION
      ===================== */}

      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <UserRound
            size={16}
            className="text-sky-600"
          />

          <h4 className="text-sm font-semibold text-[#14243B]">
            Account Information
          </h4>
        </div>

        {/* FULL NAME */}

        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-sm font-medium text-slate-700"
          >
            Full Name
          </Label>

          <div className="relative">
            <UserRound
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter full name"
              disabled={isSubmitting}
              {...register("name")}
              className={`${inputClassName} pl-10`}
            />
          </div>

          <FieldError
            message={errors.name?.message}
          />
        </div>

        {/* USERNAME */}

        <div className="space-y-1.5">
          <Label
            htmlFor="username"
            className="text-sm font-medium text-slate-700"
          >
            Username
          </Label>

          <div className="relative">
            <AtSign
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Enter username"
              disabled={isSubmitting}
              {...register("username")}
              className={`${inputClassName} pl-10`}
            />
          </div>

          <FieldError
            message={errors.username?.message}
          />
        </div>

        {/* EMAIL ADDRESS */}

        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-slate-700"
          >
            Email Address
          </Label>

          <div className="relative">
            <Mail
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter email address"
              disabled={isSubmitting}
              {...register("email")}
              className={`${inputClassName} pl-10`}
            />
          </div>

          <FieldError
            message={errors.email?.message}
          />
        </div>

        {/* PASSWORD */}

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-slate-700"
          >
            Password

            {isEdit && (
              <span className="ml-2 text-xs font-normal text-slate-400">
                (Optional)
              </span>
            )}
          </Label>

          <div className="relative">
            <LockKeyhole
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder={
                isEdit
                  ? "Leave blank to keep current password"
                  : "Enter a secure password"
              }
              disabled={isSubmitting}
              {...register("password")}
              className={`${inputClassName} pl-10`}
            />
          </div>

          <FieldError
            message={errors.password?.message}
          />

          {isEdit && (
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info size={13} />

              Leave this field blank to retain the
              existing password.
            </p>
          )}
        </div>
      </div>

      {/* =====================
          ROLE ASSIGNMENT
      ===================== */}

      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <ShieldCheck
            size={16}
            className="text-sky-600"
          />

          <h4 className="text-sm font-semibold text-[#14243B]">
            Role Assignment
          </h4>
        </div>

        <p className="text-xs text-slate-500">
          Select the roles that determine this
          user&apos;s access permissions.
        </p>

        <Controller
          name="roleIds"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {roles.map((role) => {
                const checked =
                  field.value?.includes(role.id) ??
                  false;

                return (
                  <label
                    key={role.id}
                    className={`
                      flex cursor-pointer items-center gap-3
                      rounded-xl border p-3
                      transition-all duration-200
                      ${
                        checked
                          ? "border-sky-300 bg-sky-50"
                          : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
                      }
                      ${
                        isSubmitting
                          ? "pointer-events-none opacity-60"
                          : ""
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={isSubmitting}
                      onChange={(event) => {
                        const current =
                          field.value ?? [];

                        field.onChange(
                          event.target.checked
                            ? [
                                ...new Set([
                                  ...current,
                                  role.id,
                                ]),
                              ]
                            : current.filter(
                                (id) =>
                                  id !== role.id
                              )
                        );
                      }}
                      className="h-4 w-4 shrink-0 accent-sky-600"
                    />

                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <ShieldCheck
                        size={16}
                        className={
                          checked
                            ? "text-sky-600"
                            : "text-slate-400"
                        }
                      />

                      <span className="truncate text-sm font-medium text-slate-700">
                        {role.name}
                      </span>
                    </div>

                    {checked && (
                      <Check
                        size={16}
                        className="shrink-0 text-sky-600"
                      />
                    )}
                  </label>
                );
              })}

              {roles.length === 0 && (
                <p className="col-span-full rounded-lg border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
                  No roles available.
                </p>
              )}
            </div>
          )}
        />

        <FieldError
          message={errors.roleIds?.message}
        />
      </div>

      {/* =====================
          BRANCH ASSIGNMENT
      ===================== */}

      <div className="space-y-3 border-t border-slate-100 pt-4">
        <Controller
          name="branchIds"
          control={control}
          render={({ field, fieldState }) => (
            <UserBranchSelect
              value={field.value ?? []}
              onChange={field.onChange}
              disabled={isSubmitting}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      {/* =====================
          ACCOUNT STATUS
      ===================== */}

      {isEdit && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Account Status
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Allow this user to access the
                    system.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={field.value ?? false}
                  onChange={(event) =>
                    field.onChange(
                      event.target.checked
                    )
                  }
                  disabled={isSubmitting}
                  className="h-5 w-5 shrink-0 accent-sky-600"
                />
              </label>
            )}
          />
        </div>
      )}
    </form>
  );
}