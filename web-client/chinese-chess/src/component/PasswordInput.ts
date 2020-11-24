import TextInput, { TextInputProps } from "./TextInput";

interface PasswordInputProps extends TextInputProps {}

export default class PasswordInput extends TextInput {
    constructor(props: PasswordInputProps) {
        super(props);

        this.textEdit.displayAsPassword = true;
    }
}