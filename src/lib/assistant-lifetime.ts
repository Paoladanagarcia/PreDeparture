/** One budget covers connection, generation, stream reading and any model fallback. */
export function requestLifetime(external?: AbortSignal, timeoutMs = 55000) {
  const controller = new AbortController();
  const cancel = () =>
    controller.abort(external?.reason ?? new DOMException("Stopped", "AbortError"));
  if (external?.aborted) cancel();
  else external?.addEventListener("abort", cancel, { once: true });
  const timer = setTimeout(
    () => controller.abort(new DOMException("Response timed out", "TimeoutError")),
    timeoutMs,
  );
  return {
    signal: controller.signal,
    abort: () => controller.abort(new DOMException("Connection closed", "AbortError")),
    dispose: () => {
      clearTimeout(timer);
      external?.removeEventListener("abort", cancel);
    },
  };
}

export function assistantErrorMessage(error: unknown, language?: string) {
  const code = error instanceof Error ? error.message : "";
  const name = error instanceof Error ? error.name : "";
  const fr = language === "fr";
  if (name === "TimeoutError" || code === "timeout")
    return fr
      ? "La réponse prend trop de temps. Votre question est conservée : vous pouvez réessayer."
      : "The response took too long. Your question is saved; please retry.";
  if (name === "AbortError")
    return fr ? "Réponse arrêtée. Vous pouvez réessayer." : "Response stopped. You can retry.";
  if (code === "quota")
    return fr
      ? "La limite temporaire de l’assistant est atteinte. Réessayez un peu plus tard."
      : "The assistant has reached its temporary usage limit. Please try later.";
  if (code === "incomplete")
    return fr
      ? "La réponse est incomplète. Vous pouvez réessayer pour obtenir une réponse complète."
      : "The response is incomplete. Retry to get a complete answer.";
  if (code === "question-too-long")
    return fr
      ? "Votre question doit contenir au maximum 1 000 caractères."
      : "Please keep your question within 1,000 characters.";
  return fr
    ? "L’assistant est momentanément indisponible. Votre question est conservée : réessayez."
    : "The assistant is temporarily unavailable. Your question is saved; please retry.";
}
