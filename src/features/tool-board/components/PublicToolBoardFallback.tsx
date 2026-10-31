import { Container } from "@/components/ui";

export function PublicToolBoardFallback() {
  return (
    <section aria-labelledby="public-board-heading" aria-busy="true">
      <Container className="py-section-y">
        <h2
          id="public-board-heading"
          className="font-display text-4xl font-extrabold leading-none text-ink"
        >
          On the board
        </h2>
        <p className="mt-2 text-base text-ink-muted">Loading listings…</p>
      </Container>
    </section>
  );
}
