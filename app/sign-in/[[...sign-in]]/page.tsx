import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  const showWeChat = Boolean(process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET);

  return (
    <SignInForm showWeChat={showWeChat} />
  );
}
