-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timer" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subheading" TEXT,
    "buttonText" TEXT NOT NULL,
    "link" TEXT,
    "timerType" TEXT NOT NULL,
    "endDate" TEXT,
    "endTime" TEXT,
    "fixedMinutes" TEXT,
    "timerLabels" JSONB NOT NULL,
    "bgColor" TEXT NOT NULL,
    "borderRadius" TEXT NOT NULL,
    "borderSize" TEXT NOT NULL,
    "borderColor" TEXT NOT NULL,
    "paddingTopBottom" TEXT NOT NULL,
    "paddingInside" TEXT NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "titleSize" TEXT NOT NULL,
    "titleColor" TEXT NOT NULL,
    "productTarget" TEXT NOT NULL,
    "geoTarget" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timer_pkey" PRIMARY KEY ("id")
);
