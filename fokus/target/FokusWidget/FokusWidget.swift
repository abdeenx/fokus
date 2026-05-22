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

struct FokusSmallView: View {
    let entry: FokusProvider.Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: entry.data.iconName)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
                .padding(6)
                .background(Color.white.opacity(0.18))
                .clipShape(Circle())
            Spacer(minLength: 0)
            Text(entry.data.text)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(4)
                .minimumScaleFactor(0.75)
                .multilineTextAlignment(.leading)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct FokusMediumView: View {
    let entry: FokusProvider.Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Image(systemName: entry.data.iconName)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(6)
                    .background(Color.white.opacity(0.18))
                    .clipShape(Circle())
                Text(entry.data.displayLabel.uppercased())
                    .font(.system(size: 11, weight: .bold))
                    .tracking(0.6)
                    .foregroundColor(.white.opacity(0.85))
                Spacer()
            }
            Text(entry.data.text)
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(4)
                .minimumScaleFactor(0.8)
                .multilineTextAlignment(.leading)
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct FokusLargeView: View {
    let entry: FokusProvider.Entry
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: entry.data.iconName)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(8)
                    .background(Color.white.opacity(0.18))
                    .clipShape(Circle())
                Text(entry.data.displayLabel.uppercased())
                    .font(.system(size: 12, weight: .bold))
                    .tracking(0.6)
                    .foregroundColor(.white.opacity(0.85))
                Spacer()
            }
            Text(entry.data.text)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(10)
                .minimumScaleFactor(0.7)
                .multilineTextAlignment(.leading)
            Spacer()
            VStack(alignment: .leading, spacing: 6) {
                Text("Last updated · \(entry.data.lastUpdatedLabel)")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.75))
                Rectangle()
                    .fill(Color(red: 0.96, green: 0.62, blue: 0.04))
                    .frame(height: 2)
                    .cornerRadius(1)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
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
        default:
            FokusSmallView(entry: entry)
        }
    }
}

struct FokusWidget: Widget {
    let kind = "FokusWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FokusProvider()) { entry in
            FokusWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    FokusGradient()
                }
        }
        .configurationDisplayName("Fokus")
        .description("Your daily focus, always visible.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
