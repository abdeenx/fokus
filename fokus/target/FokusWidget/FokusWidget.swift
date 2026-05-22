import WidgetKit
import SwiftUI

let AppGroupID = "group.com.example.fokus"

struct FokusData: Codable {
    var text: String
    var category: String     // "focus" | "goal" | "quote" | "reminder"
    var lastUpdated: String  // ISO 8601
}

private let placeholderData = FokusData(
    text: "Set today's focus",
    category: "focus",
    lastUpdated: ISO8601DateFormatter().string(from: Date())
)

private func loadFokusData() -> FokusData {
    guard let defaults = UserDefaults(suiteName: AppGroupID),
          let raw = defaults.string(forKey: "fokusData"),
          let data = raw.data(using: .utf8),
          let decoded = try? JSONDecoder().decode(FokusData.self, from: data),
          !decoded.text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    else {
        return placeholderData
    }
    return decoded
}

struct FokusEntry: TimelineEntry {
    let date: Date
    let data: FokusData
}

struct FokusProvider: TimelineProvider {
    func placeholder(in context: Context) -> FokusEntry {
        FokusEntry(date: Date(), data: placeholderData)
    }

    func getSnapshot(in context: Context, completion: @escaping (FokusEntry) -> Void) {
        completion(FokusEntry(date: Date(), data: loadFokusData()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<FokusEntry>) -> Void) {
        let entry = FokusEntry(date: Date(), data: loadFokusData())
        let nextRefresh = Date().addingTimeInterval(30 * 60)
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }
}

private extension FokusData {
    var iconName: String {
        switch category {
        case "goal": return "flag.fill"
        case "quote": return "quote.bubble.fill"
        case "reminder": return "bell.fill"
        default: return "target"
        }
    }

    var displayLabel: String {
        switch category {
        case "goal": return "Goal"
        case "quote": return "Quote"
        case "reminder": return "Reminder"
        default: return "Today's Focus"
        }
    }

    var lastUpdatedLabel: String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: lastUpdated) else { return "" }
        let display = DateFormatter()
        display.dateStyle = .medium
        display.timeStyle = .short
        return display.string(from: date)
    }
}

// MARK: - Liquid Glass primitives

private struct FokusGradient: View {
    var body: some View {
        LinearGradient(
            gradient: Gradient(colors: [
                Color(red: 0.388, green: 0.4, blue: 0.945),    // #6366F1
                Color(red: 0.31, green: 0.275, blue: 0.898),   // #4F46E5
                Color(red: 0.263, green: 0.22, blue: 0.792)    // #4338CA
            ]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

/// Soft top-left highlight that gives the gradient depth (the "sheen" you see
/// on Apple's Liquid Glass surfaces).
private struct FokusSheen: View {
    var body: some View {
        LinearGradient(
            gradient: Gradient(colors: [
                Color.white.opacity(0.22),
                Color.white.opacity(0.0)
            ]),
            startPoint: .topLeading,
            endPoint: .center
        )
    }
}

/// A glass pill with a translucent material fill and a soft white edge
/// highlight — the signature Liquid Glass control surface.
private struct GlassPill<Content: View>: View {
    var radius: CGFloat = 12
    @ViewBuilder var content: () -> Content

    var body: some View {
        content()
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .strokeBorder(Color.white.opacity(0.55), lineWidth: 0.6)
            )
            .overlay(
                RoundedRectangle(cornerRadius: radius, style: .continuous)
                    .fill(Color.white.opacity(0.08))
            )
    }
}

private struct FokusIconBubble: View {
    let name: String
    var size: CGFloat = 14

    var body: some View {
        GlassPill(radius: (size + 14) / 2) {
            Image(systemName: name)
                .font(.system(size: size, weight: .semibold))
                .foregroundColor(.white)
                .frame(width: size + 14, height: size + 14)
        }
    }
}

private struct FokusLabelPill: View {
    let text: String
    var body: some View {
        GlassPill(radius: 999) {
            Text(text)
                .font(.system(size: 10, weight: .bold))
                .tracking(0.8)
                .foregroundColor(.white)
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
        }
    }
}

// MARK: - Size variants

struct FokusSmallView: View {
    let entry: FokusProvider.Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            FokusIconBubble(name: entry.data.iconName, size: 14)
            Spacer(minLength: 0)
            Text(entry.data.text)
                .font(.system(size: 15, weight: .bold, design: .default))
                .foregroundColor(.white)
                .lineLimit(4)
                .minimumScaleFactor(0.7)
                .multilineTextAlignment(.leading)
                .kerning(-0.2)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct FokusMediumView: View {
    let entry: FokusProvider.Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                FokusIconBubble(name: entry.data.iconName, size: 14)
                FokusLabelPill(text: entry.data.displayLabel.uppercased())
                Spacer()
            }
            Text(entry.data.text)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(4)
                .minimumScaleFactor(0.75)
                .multilineTextAlignment(.leading)
                .kerning(-0.2)
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct FokusLargeView: View {
    let entry: FokusProvider.Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(spacing: 8) {
                FokusIconBubble(name: entry.data.iconName, size: 16)
                FokusLabelPill(text: entry.data.displayLabel.uppercased())
                Spacer()
            }
            Text(entry.data.text)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(10)
                .minimumScaleFactor(0.65)
                .multilineTextAlignment(.leading)
                .kerning(-0.3)
            Spacer()
            VStack(alignment: .leading, spacing: 8) {
                Text("Last updated · \(entry.data.lastUpdatedLabel)")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.78))
                Capsule()
                    .fill(Color(red: 0.96, green: 0.62, blue: 0.04))
                    .frame(width: 56, height: 2)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

// MARK: - Lock Screen accessory variants

/// Circular accessory (iOS 16+). Lock Screen rendering mode is monochrome with
/// vibrancy, so we only emit a glyph + a small indicator ring.
struct FokusAccessoryCircularView: View {
    let entry: FokusProvider.Entry
    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            VStack(spacing: 2) {
                Image(systemName: entry.data.iconName)
                    .font(.system(size: 16, weight: .semibold))
                Text(entry.data.displayLabel.uppercased())
                    .font(.system(size: 8, weight: .heavy))
                    .tracking(0.5)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .padding(6)
        }
        .widgetAccentable()
    }
}

/// Rectangular accessory (iOS 16+). Shows the category + truncated text.
struct FokusAccessoryRectangularView: View {
    let entry: FokusProvider.Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 4) {
                Image(systemName: entry.data.iconName)
                    .font(.system(size: 11, weight: .semibold))
                Text(entry.data.displayLabel.uppercased())
                    .font(.system(size: 10, weight: .heavy))
                    .tracking(0.6)
            }
            .widgetAccentable()
            Text(entry.data.text)
                .font(.system(size: 13, weight: .semibold))
                .lineLimit(2)
                .minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

/// Inline accessory (iOS 16+). One short line above the clock.
struct FokusAccessoryInlineView: View {
    let entry: FokusProvider.Entry
    var body: some View {
        Label {
            Text(entry.data.text)
        } icon: {
            Image(systemName: entry.data.iconName)
        }
    }
}

struct FokusWidgetEntryView: View {
    var entry: FokusProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            FokusSmallView(entry: entry)
        case .systemMedium:
            FokusMediumView(entry: entry)
        case .systemLarge:
            FokusLargeView(entry: entry)
        case .accessoryCircular:
            FokusAccessoryCircularView(entry: entry)
        case .accessoryRectangular:
            FokusAccessoryRectangularView(entry: entry)
        case .accessoryInline:
            FokusAccessoryInlineView(entry: entry)
        default:
            FokusSmallView(entry: entry)
        }
    }
}

/// Picks the right background per-family at render time. Home-screen families
/// get the indigo gradient + sheen; accessory (Lock Screen) families get a
/// fully transparent background so the system vibrancy can take over.
struct FokusContainerBackground: View {
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryCircular, .accessoryRectangular, .accessoryInline:
            Color.clear
        default:
            ZStack {
                FokusGradient()
                FokusSheen()
            }
        }
    }
}

struct FokusWidget: Widget {
    let kind = "FokusWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FokusProvider()) { entry in
            FokusWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    FokusContainerBackground()
                }
        }
        .configurationDisplayName("Fokus")
        .description("Your daily focus, always visible.")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .systemLarge,
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline,
        ])
    }
}
