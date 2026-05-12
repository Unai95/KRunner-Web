package local.kotlinrunner;

import org.jetbrains.kotlin.cli.common.ExitCode;
import org.jetbrains.kotlin.cli.jvm.K2JVMCompiler;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

public class KotlinLocalRunner {
    private static final int MAX_OUTPUT_BYTES = 1024 * 1024;

    public static void main(String[] args) throws Exception {
        if (args.length < 3) {
            System.out.println(jsonResult("", "Uso: java -jar kotlin-local-runner.jar <Main.kt> <stdin.txt> <timeoutMs>", 2, "", 2));
            return;
        }

        Path source = Path.of(args[0]);
        Path stdin = Path.of(args[1]);
        long timeoutMs = Long.parseLong(args[2]);
        Path workDir = Files.createTempDirectory("kotlin-runner-local-");
        Path classesDir = workDir.resolve("classes");
        Files.createDirectories(classesDir);
        String runnerJar = Path.of(KotlinLocalRunner.class.getProtectionDomain().getCodeSource().getLocation().toURI()).toString();

        ByteArrayOutputStream compilerOutput = new ByteArrayOutputStream();
        PrintStream compilerStream = new PrintStream(compilerOutput, true, StandardCharsets.UTF_8);

        ExitCode compileCode;
        try {
            compileCode = new K2JVMCompiler().exec(compilerStream,
                    "-no-reflect",
                    "-no-stdlib",
                    "-classpath", runnerJar,
                    "-d", classesDir.toString(),
                    source.toString());
        } catch (Throwable throwable) {
            String message = throwable.getMessage() == null ? throwable.toString() : throwable.getMessage();
            System.out.println(jsonResult("", message, 1, compilerOutput.toString(StandardCharsets.UTF_8), 1));
            deleteQuietly(workDir);
            return;
        }

        String compileText = compilerOutput.toString(StandardCharsets.UTF_8);
        if (compileCode != ExitCode.OK) {
            System.out.println(jsonResult("", compileText, 1, compileText, 1));
            deleteQuietly(workDir);
            return;
        }

        ProcessBuilder builder = new ProcessBuilder(
                "java",
                "-Xmx128m",
                "-Djava.awt.headless=true",
                "-cp", classesDir + System.getProperty("path.separator") + runnerJar,
                "MainKt");
        builder.directory(workDir.toFile());
        Process process = builder.start();

        byte[] stdinBytes = Files.exists(stdin) ? Files.readAllBytes(stdin) : new byte[0];
        process.getOutputStream().write(stdinBytes);
        process.getOutputStream().close();

        CompletableFuture<String> stdoutFuture = CompletableFuture.supplyAsync(() -> readAllUnchecked(process.getInputStream()));
        CompletableFuture<String> stderrFuture = CompletableFuture.supplyAsync(() -> readAllUnchecked(process.getErrorStream()));

        boolean finished = process.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
        if (!finished) {
            process.destroyForcibly();
            process.waitFor(2, TimeUnit.SECONDS);
            String stdout = awaitOutput(stdoutFuture);
            String stderr = awaitOutput(stderrFuture) + "\nTiempo limite excedido (" + Duration.ofMillis(timeoutMs).toSeconds() + "s)";
            System.out.println(jsonResult(stdout, stderr.strip(), 124, compileText, 0));
            deleteQuietly(workDir);
            return;
        }

        String stdout = awaitOutput(stdoutFuture);
        String stderr = awaitOutput(stderrFuture);
        System.out.println(jsonResult(stdout, stderr, process.exitValue(), compileText, 0));
        deleteQuietly(workDir);
    }

    private static String readBounded(InputStream input) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int total = 0;
        boolean truncated = false;

        for (int read = input.read(buffer); read != -1; read = input.read(buffer)) {
            if (total < MAX_OUTPUT_BYTES) {
                int remaining = MAX_OUTPUT_BYTES - total;
                output.write(buffer, 0, Math.min(read, remaining));
            }
            total += read;
            truncated = truncated || total > MAX_OUTPUT_BYTES;
        }

        String text = output.toString(StandardCharsets.UTF_8);
        if (truncated) {
            text += "\n[Salida truncada a " + MAX_OUTPUT_BYTES + " bytes]";
        }
        return text;
    }

    private static String readAllUnchecked(InputStream input) {
        try {
            return readBounded(input);
        } catch (IOException exception) {
            return exception.getMessage() == null ? exception.toString() : exception.getMessage();
        }
    }

    private static String awaitOutput(CompletableFuture<String> future) {
        try {
            return future.get(2, TimeUnit.SECONDS);
        } catch (Exception exception) {
            return exception.getMessage() == null ? exception.toString() : exception.getMessage();
        }
    }

    private static String jsonResult(String stdout, String stderr, int code, String compileOutput, int compileCode) {
        return """
                {
                  "compile": {
                    "code": %d,
                    "stdout": "",
                    "stderr": "%s",
                    "output": "%s"
                  },
                  "run": {
                    "code": %d,
                    "stdout": "%s",
                    "stderr": "%s",
                    "output": "%s"
                  }
                }
                """.formatted(
                compileCode,
                json(compileOutput),
                json(compileOutput),
                code,
                json(stdout),
                json(stderr),
                json(stdout + stderr)
        );
    }

    private static String json(String value) {
        StringBuilder out = new StringBuilder();
        for (char c : value.toCharArray()) {
            switch (c) {
                case '\\' -> out.append("\\\\");
                case '"' -> out.append("\\\"");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                default -> {
                    if (c < 0x20) out.append("\\u%04x".formatted((int) c));
                    else out.append(c);
                }
            }
        }
        return out.toString();
    }

    private static void deleteQuietly(Path root) {
        try {
            if (!Files.exists(root)) return;
            List<Path> paths = new ArrayList<>();
            try (var stream = Files.walk(root)) {
                stream.forEach(paths::add);
            }
            for (int i = paths.size() - 1; i >= 0; i--) {
                Files.deleteIfExists(paths.get(i));
            }
        } catch (IOException ignored) {
        }
    }
}
