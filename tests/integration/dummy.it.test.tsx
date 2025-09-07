import { render, screen } from "@testing-library/react";
function Hello() {
    return <h1>Hi</h1>;
}
test("renders", () => {
    render(<Hello />);
    expect(screen.getByText("Hi")).toBeInTheDocument();
});
