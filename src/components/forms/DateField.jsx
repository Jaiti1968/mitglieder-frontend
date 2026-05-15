import FormField from "./FormField";

export default function DateField(props) {
  return <FormField {...props} type="text" placeholder="TT.MM.JJJJ" />;
}
