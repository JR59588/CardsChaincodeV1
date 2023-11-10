import { Input } from "./Input";

export const Form = () => {
  return (
    <div className="container mt-5 text-center">
      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="name"
          type="text"
          id="name"
          placeholder="type your name..."
        />
        <Input
          label="password"
          type="password"
          id="password"
          placeholder="type your password..."
        />
      </div>
    </div>
  );
};
