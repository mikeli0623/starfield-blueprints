"use client";
import useRequest from "@/app/hooks/useRequest";
import React, { useEffect, useState } from "react";
import Button from "@/app/components/Button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import InputPassword from "@/app/components/form/InputPassword";
import ErrorText from "@/app/components/ErrorText";
import PasswordChecklist from "react-password-checklist";

export default function Page({}: {}) {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypedNewPassword, setRetypedNewPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);

  const handleChangePassword = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPassword(e.target.value);
  };

  const handleChangeNewPassword = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNewPassword(e.target.value);
  };

  const handleChangeRetypedNewPassword = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setRetypedNewPassword(e.target.value);
  };

  const {
    mutate: checkPassword,
    res: passwordCheckRes,
    error,
  } = useRequest("POST", `/auth/checkPassword`);

  const handleConfirmPassword = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    checkPassword({ password });
  };

  const {
    mutate: updatePassword,
    res: passwordUpdateRes,
    error: updateError,
  } = useRequest("PATCH", `/users/updatePassword`);

  const handleUpdatePassword = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    updatePassword({ password: newPassword });
  };

  const router = useRouter();

  useEffect(() => {
    if (passwordUpdateRes && !updateError) {
      toast.success("Password changed");
      router.back();
    }
  }, [passwordUpdateRes, updateError, router]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-2">
      <Button
        className="btn-secondary self-start"
        handleClick={() => router.back()}
      >
        Back
      </Button>
      <form className="flex flex-col items-center gap-2">
        {!passwordCheckRes && (
          <>
            <InputPassword
              type="Current Password"
              password={password}
              handleChangePassword={handleChangePassword}
            />
            <Button handleClick={handleConfirmPassword}>Confirm</Button>
          </>
        )}
        {passwordCheckRes && !error && (
          <>
            <InputPassword
              type="New Password"
              password={newPassword}
              handleChangePassword={handleChangeNewPassword}
            />
            <InputPassword
              type="Retype New Password"
              password={retypedNewPassword}
              handleChangePassword={handleChangeRetypedNewPassword}
            />
            <PasswordChecklist
              onChange={(isValid) => setValidPassword(isValid)}
              rules={["minLength", "specialChar", "number", "capital", "match"]}
              minLength={5}
              value={newPassword}
              valueAgain={retypedNewPassword}
              messages={{
                specialChar: "Password has a special character.",
              }}
            />
            <Button handleClick={handleUpdatePassword}>Confirm</Button>
          </>
        )}
        {error && <ErrorText text={error} />}
      </form>
    </main>
  );
}
